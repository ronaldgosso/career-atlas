const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

/**
 * Candidate Mistral models ordered by reliability and rate-limit tolerance:
 * 1. open-mistral-7b: Free & standard tier workhorse model with high throughput.
 * 2. ministral-8b-latest: Modern, fast 8B instruction model.
 * 3. mistral-tiny: Lightweight legacy fallback model.
 * 4. mistral-small-latest: Higher-tier model (retained as candidate if tier permits).
 */
export const CANDIDATE_MODELS = [
    "open-mistral-7b",
    "ministral-8b-latest",
    "mistral-tiny",
    "mistral-small-latest",
] as const;

let activeWorkingModel: string | null = null;

/**
 * Safely extracts the Mistral API key from server environment.
 * Supports MISTRAL_API_KEY, MISTRAL_APIKEY, and NEXT_PUBLIC_MISTRAL_API_KEY.
 * Automatically cleans leading/trailing whitespace and surrounding quotes.
 */
export function getMistralApiKey(): string | undefined {
    if (typeof process === "undefined" || !process?.env) return undefined;
    const rawKey =
        process.env.MISTRAL_API_KEY ||
        process.env.MISTRAL_APIKEY ||
        process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

    if (!rawKey) return undefined;

    let key = rawKey.trim();
    // Strip accidental surrounding quotes commonly pasted into hosting dashboards
    if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
    ) {
        key = key.slice(1, -1).trim();
    }

    return key || undefined;
}

/**
 * Returns the candidate models list, prioritizing a previously confirmed working model
 * or a user-specified MISTRAL_MODEL environment override.
 */
export function getCandidateModels(): string[] {
    const customModel = typeof process !== "undefined" ? process?.env?.MISTRAL_MODEL?.trim() : undefined;
    const candidates: string[] = [];

    // If an active working model was already verified in this runtime, try it first
    if (activeWorkingModel && !candidates.includes(activeWorkingModel)) {
        candidates.push(activeWorkingModel);
    }

    // If the user specified a custom model in environment
    if (customModel && !candidates.includes(customModel)) {
        candidates.push(customModel);
    }

    // Append default fallback candidates
    for (const model of CANDIDATE_MODELS) {
        if (!candidates.includes(model)) {
            candidates.push(model);
        }
    }

    return candidates;
}

/**
 * Resets the runtime-cached working model. Useful for tests or after credentials change.
 */
export function resetActiveModel(): void {
    activeWorkingModel = null;
}

export async function callMistral(
    prompt: string,
    signal?: AbortSignal
): Promise<ReadableStream<Uint8Array> | null> {
    const apiKey = getMistralApiKey();
    if (!apiKey) {
        throw new Error(
            "MISTRAL_API_KEY missing in server environment. Please set MISTRAL_API_KEY in your production hosting settings (e.g. Vercel Project Settings > Environment Variables) and redeploy."
        );
    }

    const candidateModels = getCandidateModels();
    let lastError: Error | null = null;

    for (let i = 0; i < candidateModels.length; i++) {
        const model = candidateModels[i];
        if (signal?.aborted) {
            throw new Error("Request aborted");
        }

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
                const error = new Error(`AI model error (${status}) with model '${model}': ${parsedMessage}`);
                (error as { status?: number }).status = status;

                // Stop immediately if credentials are unauthorized/forbidden
                if (status === 401 || status === 403) {
                    throw error;
                }

                // If currently cached model failed, clear cache
                if (activeWorkingModel === model) {
                    activeWorkingModel = null;
                }

                console.warn(
                    `[Mistral AI] Candidate '${model}' returned status ${status} (${parsedMessage}). Trying next candidate...`
                );
                lastError = error;
                continue; // Try next candidate model
            }

            if (!response.body) {
                throw new Error(`AI model '${model}' returned an empty response body`);
            }

            // Immediately break and record successful model to avoid redundant fallback overhead
            activeWorkingModel = model;

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

            // Do not retry authorization or invalid key errors across candidates
            if (
                errorMsg.includes("401") ||
                errorMsg.includes("403") ||
                errorMsg.includes("Unauthorized") ||
                errorMsg.includes("missing in server env")
            ) {
                throw err;
            }

            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`[Mistral AI] Error invoking model '${model}': ${errorMsg}. Falling back...`);
        }
    }

    throw lastError || new Error("All candidate Mistral models failed to respond");
}

