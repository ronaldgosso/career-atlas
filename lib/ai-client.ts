const HF_API_BASE = "https://api-inference.huggingface.co/models";
const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

export async function callHuggingFace(
  prompt: string,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HF_API_KEY missing in server env");

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const res = await fetch(`${HF_API_BASE}/${HF_MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.4,
            return_full_text: false,
          },
          stream: true,
        }),
        signal,
      });

      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          retries--;
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`HF API Error: ${res.status} ${res.statusText}`);
      }

      return res.body;
    } catch (err) {
      retries--;
      if (retries <= 0) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("Max retries exceeded for HF API");
}