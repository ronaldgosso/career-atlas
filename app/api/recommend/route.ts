import { NextRequest, NextResponse } from "next/server";
import { RecommendRequest, RecommendationSchema } from "@/lib/validators";
import { callHuggingFace } from "@/lib/ai-client";

const SYSTEM_PROMPT = `You are an expert career architect. Output ONLY valid JSON. No markdown, no explanations.
Follow this exact structure:
{
  "books": [{"title":"...", "detail":"Author & Edition", "url":"...", "reason":"Why it's essential for this region/field"}],
  "videos": [{"title":"...", "detail":"Channel/Creator", "url":"...", "reason":"..."}],
  "projects": [{"title":"...", "detail":"Scope & Deliverables", "url":"...", "reason":"..."}],
  "online_resources": [{"title":"...", "detail":"Platform Type", "url":"...", "reason":"..."}],
  "professional_titles": [{"title":"...", "level":"Entry/Mid/Senior/Lead", "salary_range":"...", "reason":"..."}],
  "metadata": {"region":"...", "currency_symbol":"$|€|£|¥|₹|₺|₦|KSh|A$|R$|AED", "generated_at":"ISO8601"}
}
Adapt resources to university syllabi norms for {region}. Provide 10 items per category. Use realistic, current salary ranges for {region}.`;

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json().catch(() => null);
  const parsed = RecommendRequest.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { location, field } = parsed.data;
  const prompt = `${SYSTEM_PROMPT.replace("{region}", `${location.city}, ${location.country}`).replace("{field}", field)}`;

  try {
    const stream = await callHuggingFace(prompt);
    if (!stream) {
      return NextResponse.json({ error: "Stream initialization failed" }, { status: 502 });
    }

    // Stream raw tokens directly to client. Parser handles validation downstream.
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("[AI Route Error]", err.message);
    return NextResponse.json({ error: err.message || "AI service unavailable" }, { status: 503 });
  }
}