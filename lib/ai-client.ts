const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = "mistral-small-latest";

export async function callMistral(
    prompt: string,
    signal?: AbortSignal
): Promise<ReadableStream<Uint8Array> | null> {
    const apiKey = process.env.MISTRAL_API_KEY || process.env.MISTRAL_APIKEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY missing in server env");

    const model = process.env.MISTRAL_MODEL || DEFAULT_MODEL;

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
        try {
            const response = await fetch(MISTRAL_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "text/event-stream",
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1024,
                    temperature: 0.7,
                    stream: true,
                }),
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                let parsedMessage = errorText;
                try {
                    const parsedJson = JSON.parse(errorText);
                    parsedMessage = parsedJson.message || parsedJson.error?.message || errorText;
                } catch {
                    // Use raw text fallback
                }

                const status = response.status;
                const error = new Error(`Mistral API error (${status}): ${parsedMessage}`);
                (error as { status?: number }).status = status;
                throw error;
            }

            if (!response.body) {
                throw new Error("Mistral API returned an empty response body");
            }

            const bodyReader = response.body.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            return new ReadableStream<Uint8Array>({
                async start(controller) {
                    let buffer = "";
                    try {
                        while (true) {
                            const { done, value } = await bodyReader.read();
                            if (done) break;

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split("\n");
                            buffer = lines.pop() || "";

                            for (const line of lines) {
                                const trimmed = line.trim();
                                if (!trimmed || trimmed.startsWith(":") || !trimmed.startsWith("data:")) continue;
                                const dataStr = trimmed.slice(5).trim();
                                if (dataStr === "[DONE]") continue;

                                try {
                                    const parsed = JSON.parse(dataStr);
                                    const content = parsed.choices?.[0]?.delta?.content || "";
                                    if (content) {
                                        controller.enqueue(encoder.encode(content));
                                    }
                                } catch {
                                    // Skip unparseable non-JSON lines
                                }
                            }
                        }

                        // Flush remaining buffer
                        if (buffer.trim().startsWith("data:")) {
                            const dataStr = buffer.trim().slice(5).trim();
                            if (dataStr && dataStr !== "[DONE]") {
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    const content = parsed.choices?.[0]?.delta?.content || "";
                                    if (content) {
                                        controller.enqueue(encoder.encode(content));
                                    }
                                } catch {
                                    // ignore parse error
                                }
                            }
                        }

                        controller.close();
                    } catch (err) {
                        if (err instanceof Error && err.message.includes("token")) {
                            controller.error(new Error("Response exceeded token limit. Try a simpler request."));
                        } else {
                            controller.error(err);
                        }
                    }
                },
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);

            // Handle token limit errors specifically
            if (errorMsg.includes("token") || errorMsg.includes("length")) {
                throw new Error("Response exceeded token limit. Try a simpler request.");
            }

            // Do not retry authorization or invalid key errors
            if (
                errorMsg.includes("401") ||
                errorMsg.includes("403") ||
                errorMsg.includes("Unauthorized") ||
                errorMsg.includes("missing in server env")
            ) {
                throw err;
            }

            const isRateLimit =
                errorMsg.includes("429") ||
                errorMsg.includes("rate limit") ||
                errorMsg.includes("throttling") ||
                errorMsg.includes("quota");

            retries--;
            if (retries <= 0) throw err;

            // Use longer wait time with random jitter for 429 rate limits
            const waitTime = isRateLimit
                ? delay + Math.floor(Math.random() * 1500) + 1000
                : delay;

            await new Promise((r) => setTimeout(r, waitTime));
            delay *= 2;
        }
    }
    throw new Error("Max retries exceeded for Mistral API");
}

