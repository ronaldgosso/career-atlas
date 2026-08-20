import { NextRequest, NextResponse } from "next/server";
import { RecommendRequestSchema, type RecommendationPayload } from "@/lib/validators";
import { callMistral } from "@/lib/ai-client";
import { isGeminiAvailable, searchYouTubeVideos } from "@/lib/gemini-youtube";
import { enrichBooksWithGoogleBooks, isGoogleBooksAvailable } from "@/lib/google-books";
import { getCurrencyForCountry, type CurrencyInfo } from "@/lib/currency";

export type ErrorSource = "mistral" | "gemini" | "network" | "validation" | "unknown";

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
    professional_titles: `Generate 3 professional job titles for {field} in {region}. State realistic market salary ranges in {currency_code} ({currency_symbol}). Output ONLY JSON array: [{"title":"Job Title", "level":"Entry|Mid-Level|Senior|Lead", "salary_range":"Realistic range in {currency_symbol} ({currency_code})", "reason":"Career progression context"}]`,
};

async function fetchCategory(
    category: string,
    region: string,
    field: string,
    currency: CurrencyInfo,
    signal?: AbortSignal
): Promise<unknown[]> {
    const promptTemplate = CATEGORY_PROMPTS[category];
    if (!promptTemplate) throw new Error(`Unknown category: ${category}`);

    const prompt = promptTemplate
        .replace(/{region}/g, region)
        .replace(/{field}/g, field)
        .replace(/{currency_symbol}/g, currency.symbol)
        .replace(/{currency_code}/g, currency.code);

    const stream = await callMistral(prompt, signal);
    if (!stream) throw new Error(`Failed to fetch ${category}: data stream unavailable`);

    const reader = stream.getReader();
    let result = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
    }

    try {
        // Extract JSON array from response (handle conversational text before/after JSON)
        const firstBracket = result.indexOf('[');
        const lastBracket = result.lastIndexOf(']');
        
        let jsonStr = result.trim();
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonStr = result.substring(firstBracket, lastBracket + 1);
        }
        
        const json = JSON.parse(jsonStr);
        return Array.isArray(json) ? json : [];
    } catch {
        return [];
    }
}

function classifyMistralError(err: unknown): string {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = rawMsg || "Data service unavailable";
    const lower = msg.toLowerCase();

    if (
        lower.includes("401") ||
        lower.includes("403") ||
        lower.includes("unauthorized") ||
        lower.includes("token") ||
        lower.includes("api key") ||
        lower.includes("mistral_api_key missing")
    ) {
        return "Service authorization notice. Please check system credentials.";
    }
    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("too many") || lower.includes("quota")) {
        return "Market data servers are experiencing high volume. Please wait a moment and retry.";
    }
    if (
        lower.includes("503") ||
        lower.includes("500") ||
        lower.includes("502") ||
        lower.includes("overloaded") ||
        lower.includes("service unavailable")
    ) {
        return "Career intelligence servers are temporarily updating. Please retry in a moment.";
    }
    if (lower.includes("404") || lower.includes("model not found")) {
        return "The requested career discipline database is syncing. Please retry shortly.";
    }
    if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED") || lower.includes("network")) {
        return "Network connection issue. Unable to reach career intelligence server.";
    }
    return "Career advisory services are momentarily busy. Please retry shortly.";
}

function classifyGeminiError(err: unknown): string {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = rawMsg || "Video search service notice";
    const lower = msg.toLowerCase();

    if (lower.includes("400") && lower.includes("api key")) {
        return "Video sync authorization required.";
    }
    if (lower.includes("429") || lower.includes("quota") || lower.includes("rate limit")) {
        return "Live video query limit reached. Loading verified standard masterclasses.";
    }
    if (lower.includes("503") || lower.includes("service unavailable")) {
        return "Live video search is temporarily offline. Loading verified standard masterclasses.";
    }
    if (lower.includes("403") || lower.includes("permission")) {
        return "Video channel query requires verified credentials.";
    }
    return "Direct video search syncing. Loading standard video masterclasses.";
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
    const currency = getCurrencyForCountry(location.countryCode);

    // Track which services have failed
    const serviceErrors: { source: ErrorSource; message: string }[] = [];

    try {
        const controller = new AbortController();

        // Decide video source: Gemini (real YouTube) or Mistral (AI-generated)
        const fetchVideos = async () => {
            if (use_gemini && isGeminiAvailable()) {
                try {
                    const geminiVideos = await searchYouTubeVideos(field, region, controller.signal);
                    if (geminiVideos.length > 0) return geminiVideos;
                    // Gemini returned empty — not an error, just no results
                    console.warn("[Gemini returned 0 videos, falling back to Mistral]");
                } catch (err) {
                    const geminiMsg = classifyGeminiError(err);
                    console.warn("[Gemini Video Search Failed]", geminiMsg);
                    serviceErrors.push({ source: "gemini", message: geminiMsg });
                    // Fall through to Mistral fallback
                }
            }
            // Fallback to Mistral-generated video recommendations
            return fetchCategory("videos", region, field, currency, controller.signal);
        };

        // Fetch all categories sequentially to respect Mistral rate limits
        const categoryTasks = [
            () => fetchCategory("books", region, field, currency, controller.signal) as Promise<RecommendationPayload["books"]>,
            () => fetchVideos() as Promise<RecommendationPayload["videos"]>,
            () => fetchCategory("projects", region, field, currency, controller.signal) as Promise<RecommendationPayload["projects"]>,
            () => fetchCategory("online_resources", region, field, currency, controller.signal) as Promise<RecommendationPayload["online_resources"]>,
            () => fetchCategory("professional_titles", region, field, currency, controller.signal) as Promise<RecommendationPayload["professional_titles"]>,
        ];

        const categoryResults: PromiseSettledResult<unknown>[] = [];
        for (const task of categoryTasks) {
            try {
                const res = await task();
                categoryResults.push({ status: "fulfilled", value: res });
            } catch (err) {
                categoryResults.push({ status: "rejected", reason: err });
            }
            // Small pause between categories to stay within Mistral rate limit
            await new Promise((r) => setTimeout(r, 150));
        }

        // Separate successes and failures
        const successes = categoryResults.filter((r) => r.status === "fulfilled");
        const failures = categoryResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");

        // Record Mistral AI errors
        for (const f of failures) {
            const msg = classifyMistralError(f.reason);
            serviceErrors.push({ source: "mistral", message: msg });
        }

        // If ALL categories failed, return an error response
        if (successes.length === 0) {
            const primaryError = serviceErrors[0] || { source: "unknown" as ErrorSource, message: "Career advisory service is temporarily updating. Please retry shortly." };
            const allMessages = [...new Set(serviceErrors.map((e) => e.message))].join("\n");
            const body: ErrorResponse = {
                error: primaryError.message,
                source: primaryError.source,
                details: serviceErrors.length > 1 ? allMessages : undefined,
            };
            return NextResponse.json(body, { status: 503 });
        }

        // If some succeeded and some failed, still return partial results
        const [booksResultRaw, videosResult, projectsResult, onlineResourcesResult, professionalTitlesResult] =
            categoryResults.map((r) => (r.status === "fulfilled" ? r.value : [])) as [
                RecommendationPayload["books"],
                RecommendationPayload["videos"],
                RecommendationPayload["projects"],
                RecommendationPayload["online_resources"],
                RecommendationPayload["professional_titles"],
            ];

        // Enrich books with Google Books API (verified metadata + stable URLs)
        let booksResult = booksResultRaw;
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
                currency_symbol: currency.symbol,
                generated_at: new Date().toISOString(),
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
        // Top-level unhandled error — never expose internal service names to the client
        const internalMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("[Route Error]", internalMsg);
        const body: ErrorResponse = {
            error: "Career advisory services encountered an unexpected issue. Please retry shortly.",
            source: "unknown",
            details: "Unexpected server error",
        };
        return NextResponse.json(body, { status: 500 });
    }
}
