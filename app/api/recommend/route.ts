import { NextRequest, NextResponse } from "next/server";
import { RecommendRequestSchema, type RecommendationPayload } from "@/lib/validators";
import { callHuggingFace } from "@/lib/ai-client";
import { isGeminiAvailable, searchYouTubeVideos } from "@/lib/gemini-youtube";
import { enrichBooksWithGoogleBooks, isGoogleBooksAvailable } from "@/lib/google-books";

export type ErrorSource = "huggingface" | "gemini" | "network" | "validation" | "unknown";

interface ErrorResponse {
    error: string;
    source: ErrorSource;
    details?: string;
}

const CATEGORY_PROMPTS: Record<string, string> = {
    books: `Generate 3 book recommendations for a {field} professional in {region}. Output ONLY JSON array: [{"title":"Book Title", "detail":"Author & Edition", "url":"https://example.com", "reason":"Why this book is valuable for this region/field"}]`,
    videos: `Generate 3 video tutorial recommendations for a {field} professional in {region}. Output ONLY JSON array: [{"title":"Video Title", "detail":"Channel/Creator", "url":"https://youtube.com/...", "reason":"Why this video series is helpful"}]`,
    projects: `Generate 3 hands-on project ideas for a {field} professional in {region}. Output ONLY JSON array: [{"title":"Project Name", "detail":"Scope & key deliverables", "url":"https://github.com/...", "reason":"Skills this project demonstrates"}]`,
    online_resources: `Generate 3 online learning resources for a {field} professional in {region}. Output ONLY JSON array: [{"title":"Course/Platform Name", "detail":"Platform type (Course/Certification/etc)", "url":"https://...", "reason":"Why this resource is valuable"}]`,
    professional_titles: `Generate 3 professional job titles for {field} in {region}. Output ONLY JSON array: [{"title":"Job Title", "level":"Entry|Mid-Level|Senior|Lead", "salary_range":"Realistic range for region", "reason":"Career progression context"}]`,
};

const METADATA = {
    currency_symbol: "$",
    generated_at: new Date().toISOString(),
};

async function fetchCategory(
    category: string,
    region: string,
    field: string,
    signal?: AbortSignal
): Promise<unknown[]> {
    const promptTemplate = CATEGORY_PROMPTS[category];
    if (!promptTemplate) throw new Error(`Unknown category: ${category}`);

    const prompt = promptTemplate
        .replace("{region}", region)
        .replace("{field}", field);

    const stream = await callHuggingFace(prompt, signal);
    if (!stream) throw new Error(`Failed to fetch ${category}: AI stream unavailable`);

    const reader = stream.getReader();
    let result = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
    }

    try {
        const json = JSON.parse(result.trim());
        return Array.isArray(json) ? json : [];
    } catch {
        return [];
    }
}

function classifyHuggingFaceError(err: unknown): string {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = rawMsg || "Unknown Hugging Face error";
    const lower = msg.toLowerCase();

    if (lower.includes("401") || lower.includes("403") || lower.includes("unauthorized") || lower.includes("token")) {
        return "Invalid or expired API token. Check your HUGGINGFACE_API_KEY.";
    }
    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("too many")) {
        return "Rate limit exceeded. Hugging Face is throttling requests. Wait a moment and retry.";
    }
    if (lower.includes("503") || lower.includes("model loading") || lower.includes("model is currently loading") || lower.includes("overloaded")) {
        return "Model is loading or overloaded. The Llama 3 model is temporarily unavailable on Hugging Face. Retry in a minute.";
    }
    if (lower.includes("404") || lower.includes("not found") || lower.includes("model not found")) {
        return "Model not found. The configured Hugging Face model endpoint is incorrect.";
    }
    if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED") || lower.includes("network")) {
        return "Network error. Cannot reach Hugging Face API. Check your internet connection.";
    }
    return msg;
}

function classifyGeminiError(err: unknown): string {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = rawMsg || "Unknown Gemini error";
    const lower = msg.toLowerCase();

    if (lower.includes("400") && lower.includes("api key")) {
        return "Invalid Gemini API key. Check your GOOGLE_GEMINI_API_KEY.";
    }
    if (lower.includes("429") || lower.includes("quota") || lower.includes("rate limit")) {
        return "Gemini rate limit or quota exceeded. Retry later or check your Google Cloud quotas.";
    }
    if (lower.includes("503") || lower.includes("service unavailable")) {
        return "Gemini service is temporarily unavailable. Falling back to AI-generated videos.";
    }
    if (lower.includes("403") || lower.includes("permission")) {
        return "Gemini access denied. Verify your API key has the necessary permissions.";
    }
    return msg;
}

export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        const body: ErrorResponse = { error: "Method not allowed", source: "validation" };
        return NextResponse.json(body, { status: 405 });
    }

    const body = await req.json().catch(() => null);
    const parsed = RecommendRequestSchema.safeParse(body);

    if (!parsed.success) {
        const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        const body: ErrorResponse = { error: "Invalid request payload", source: "validation", details };
        return NextResponse.json(body, { status: 400 });
    }

    const { location, field, use_gemini } = parsed.data;
    const region = `${location.city}, ${location.country}`;

    // Track which services have failed
    const serviceErrors: { source: ErrorSource; message: string }[] = [];

    try {
        const controller = new AbortController();

        // Decide video source: Gemini (real YouTube) or Llama (AI-generated)
        const fetchVideos = async () => {
            if (use_gemini && isGeminiAvailable()) {
                try {
                    const geminiVideos = await searchYouTubeVideos(field, region, controller.signal);
                    if (geminiVideos.length > 0) return geminiVideos;
                    // Gemini returned empty — not an error, just no results
                    console.warn("[Gemini returned 0 videos, falling back to Llama]");
                } catch (err) {
                    const geminiMsg = classifyGeminiError(err);
                    console.warn("[Gemini Video Search Failed]", geminiMsg);
                    serviceErrors.push({ source: "gemini", message: geminiMsg });
                    // Fall through to Llama fallback
                }
            }
            // Fallback to Llama-generated video recommendations
            return fetchCategory("videos", region, field, controller.signal);
        };

        // Fetch all categories in parallel — track which ones fail
        const categoryResults = await Promise.allSettled([
            fetchCategory("books", region, field, controller.signal) as Promise<RecommendationPayload["books"]>,
            fetchVideos() as Promise<RecommendationPayload["videos"]>,
            fetchCategory("projects", region, field, controller.signal) as Promise<RecommendationPayload["projects"]>,
            fetchCategory("online_resources", region, field, controller.signal) as Promise<RecommendationPayload["online_resources"]>,
            fetchCategory("professional_titles", region, field, controller.signal) as Promise<RecommendationPayload["professional_titles"]>,
        ]);

        // Separate successes and failures
        const successes = categoryResults.filter((r) => r.status === "fulfilled");
        const failures = categoryResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");

        // Record Hugging Face errors
        for (const f of failures) {
            const msg = classifyHuggingFaceError(f.reason);
            serviceErrors.push({ source: "huggingface", message: msg });
        }

        // If ALL categories failed, return an error response
        if (successes.length === 0) {
            const primaryError = serviceErrors[0] || { source: "unknown" as ErrorSource, message: "All AI services failed" };
            const allMessages = [...new Set(serviceErrors.map((e) => e.message))].join("\n");
            const body: ErrorResponse = {
                error: primaryError.message,
                source: primaryError.source,
                details: serviceErrors.length > 1 ? allMessages : undefined,
            };
            return NextResponse.json(body, { status: 503 });
        }

        // If some succeeded and some failed, still return partial results
        let [booksResult, videosResult, projectsResult, onlineResourcesResult, professionalTitlesResult] =
            categoryResults.map((r) => (r.status === "fulfilled" ? r.value : [])) as [
                RecommendationPayload["books"],
                RecommendationPayload["videos"],
                RecommendationPayload["projects"],
                RecommendationPayload["online_resources"],
                RecommendationPayload["professional_titles"],
            ];

        // Enrich books with Google Books API (verified metadata + stable URLs)
        if (booksResult.length > 0 && isGoogleBooksAvailable()) {
            try {
                const enrichedBooks = await enrichBooksWithGoogleBooks(
                    booksResult,
                    field,
                    controller.signal
                );
                booksResult = enrichedBooks.map((book) => ({
                    title: book.title,
                    detail: book.detail,
                    url: book.url,
                    reason: book.reason,
                }));
            } catch (err) {
                console.warn("[Google Books Enrichment Failed]", err instanceof Error ? err.message : String(err));
                // Keep original AI-generated books as fallback
            }
        }

        const payload: RecommendationPayload = {
            books: booksResult,
            videos: videosResult,
            projects: projectsResult,
            online_resources: onlineResourcesResult,
            professional_titles: professionalTitlesResult,
            metadata: {
                region,
                currency_symbol: METADATA.currency_symbol,
                generated_at: METADATA.generated_at,
            },
        };

        // Include warnings if some services failed but we still have partial data
        if (serviceErrors.length > 0) {
            payload.metadata.warnings = serviceErrors.map((e) => e.message);
        }

        return new Response(JSON.stringify(payload), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err: unknown) {
        // Top-level unhandled error
        const msg = err instanceof Error ? err.message : "Unknown error";
        const source: ErrorSource = msg.toLowerCase().includes("gemini") ? "gemini" : msg.toLowerCase().includes("hugging") ? "huggingface" : "unknown";
        console.error("[AI Route Error]", msg);
        const body: ErrorResponse = { error: msg, source, details: "Unexpected server error" };
        return NextResponse.json(body, { status: 500 });
    }
}
