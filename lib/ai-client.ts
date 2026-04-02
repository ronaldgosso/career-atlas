import { HfInference } from "@huggingface/inference";

const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

export async function callHuggingFace(
    prompt: string,
    signal?: AbortSignal
): Promise<ReadableStream<Uint8Array> | null> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error("HF_API_KEY missing in server env");

    const hf = new HfInference(apiKey);

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
        try {
            const stream = await hf.chatCompletionStream({
                model: HF_MODEL,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2048,
                temperature: 0.4,
            }, { signal });

            // Convert async iterable to ReadableStream
            return new ReadableStream<Uint8Array>({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            const content = chunk.choices?.[0]?.delta?.content || "";
                            if (content) {
                                controller.enqueue(new TextEncoder().encode(content));
                            }
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                },
            });
        } catch (err) {
            retries--;
            if (retries <= 0) throw err;
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
        }
    }
    throw new Error("Max retries exceeded for HF API");
}
