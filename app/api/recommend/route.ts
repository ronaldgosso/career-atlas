import { NextRequest, NextResponse } from "next/server";
import { RecommendRequestSchema, type RecommendationPayload } from "@/lib/validators";
import { callHuggingFace } from "@/lib/ai-client";
import { isGeminiAvailable, searchYouTubeVideos } from "@/lib/gemini-youtube";

const CATEGORY_PROMPTS: Record<string, string> = {
    books: `Generate 3 book recommendations for a {field} professional in {region}. Output ONLY JSON array: [{"title":"Book Title", "detail":"Author & Edition", "url":"https://example.com", "reason":"Why this book is valuable for this region/field"}]`,
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
    const prompt = CATEGORY_PROMPTS[category]
        .replace("{region}", region)
        .replace("{field}", field);

    const stream = await callHuggingFace(prompt, signal);
    if (!stream) throw new Error(`Failed to fetch ${category}`);

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

export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await req.json().catch(() => null);
    const parsed = RecommendRequestSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { location, field, use_gemini } = parsed.data;
    const region = `${location.city}, ${location.country}`;

    try {
        const controller = new AbortController();

        // Decide video source: Gemini (real YouTube) or Llama (AI-generated)
        const fetchVideos = async () => {
            if (use_gemini && isGeminiAvailable()) {
                try {
                    const geminiVideos = await searchYouTubeVideos(field, region, controller.signal);
                    if (geminiVideos.length > 0) return geminiVideos;
                } catch (err) {
                    console.warn("[Gemini Video Search Failed]", err instanceof Error ? err.message : "Unknown error");
                    // Fall through to Llama fallback
                }
            }
            // Fallback to Llama-generated video recommendations
            return fetchCategory("videos", region, field, controller.signal);
        };

        // Fetch all categories in parallel
        const [books, videos, projects, online_resources, professional_titles] = await Promise.all([
            fetchCategory("books", region, field, controller.signal) as Promise<RecommendationPayload["books"]>,
            fetchVideos() as Promise<RecommendationPayload["videos"]>,
            fetchCategory("projects", region, field, controller.signal) as Promise<RecommendationPayload["projects"]>,
            fetchCategory("online_resources", region, field, controller.signal) as Promise<RecommendationPayload["online_resources"]>,
            fetchCategory("professional_titles", region, field, controller.signal) as Promise<RecommendationPayload["professional_titles"]>,
        ]);

        const payload: RecommendationPayload = {
            books,
            videos,
            projects,
            online_resources,
            professional_titles,
            metadata: {
                region,
                currency_symbol: METADATA.currency_symbol,
                generated_at: METADATA.generated_at,
            },
        };

        return new Response(JSON.stringify(payload), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err: unknown) {
        console.error("[AI Route Error]", err instanceof Error ? err.message : "Unknown error");
        return NextResponse.json({ error: err instanceof Error ? err.message : "AI service unavailable" }, { status: 503 });
    }
}
