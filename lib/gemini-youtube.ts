const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export function isGeminiAvailable(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY !== "your_api_key_here";
}

export async function searchYouTubeVideos(
  field: string,
  region: string,
  signal?: AbortSignal
): Promise<{ title: string; detail: string; url: string; reason: string }[]> {
  if (!isGeminiAvailable()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `Search YouTube and find 3 currently available video tutorials for a ${field} professional. The person is located in ${region} (consider local relevance if applicable).

For each video, provide:
- title: The exact video title as it appears on YouTube
- detail: The channel name and approximate view count or upload date
- url: The full YouTube video URL (https://www.youtube.com/watch?v=...)
- reason: Why this specific video is valuable for learning ${field}

CRITICAL RULES:
1. ONLY return videos that ACTUALLY EXIST on YouTube right now
2. Do NOT invent or hallucinate video titles, channels, or URLs
3. If you cannot find 3 real videos, return fewer (minimum 1)
4. Prefer videos with higher view counts and from reputable channels
5. Videos should be relevant to ${field} and ideally in English

Output ONLY a valid JSON array with no markdown, no explanation:
[{"title":"...","detail":"...","url":"https://www.youtube.com/watch?v=...","reason":"..."}]`;

  const res = await fetch(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          responseMimeType: "application/json",
        },
        tools: [{ googleSearch: {} }],
      }),
      signal,
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Try to extract JSON from the response (in case Gemini wraps it in markdown)
  const jsonStr = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is { title: unknown; detail?: unknown; url: unknown; reason?: unknown } =>
          typeof item === "object" && item !== null && "title" in item && "url" in item
      )
      .map((item) => ({
        title: String(item.title || ""),
        detail: typeof item.detail === "string" ? item.detail : "YouTube",
        url: String(item.url || ""),
        reason: typeof item.reason === "string" ? item.reason : "Verified industry masterclass for this discipline",
      }))
      .filter((item) => item.title && item.url);
  } catch {
    return [];
  }
}
