"use client";

import { useState, useCallback, useRef } from "react";
import { AISStreamParser } from "@/lib/ai-stream-parser";
import { GeoData, type RecommendationPayload } from "@/lib/validators";
import { getDB } from "@/lib/db";

type Status = "idle" | "loading" | "streaming" | "success" | "error";

interface RecState {
  status: Status;
  payload: RecommendationPayload | null;
  error: string | null;
  retryCount: number;
}

export function useRecommendations() {
  const [state, setState] = useState<RecState>({ status: "idle", payload: null, error: null, retryCount: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const fetchRecommendations = useCallback(async (location: GeoData, field: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading", payload: null, error: null, retryCount: 0 });

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, field }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(res.statusText || "Network response failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const parser = new AISStreamParser();
      setState((prev) => ({ ...prev, status: "streaming" }));

      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const parsed = parser.feed(text);
        if (parsed) {
          setState((prev) => ({ ...prev, status: "success", payload: parsed, retryCount: 0 }));
          break;
        }
        chunkCount++;
        if (chunkCount > 500) throw new Error("Stream exceeded token limit");
      }

      // Persist to IndexedDB for offline dashboard
      if (state.payload || parser.feed) {
        const final = state.payload || await parser.feed("");
        if (final) {
          const db = await getDB();
          await db.put("recommendations", {
            id: `${location.city}-${field}-${Date.now()}`,
            location,
            field,
            data: final,
            generatedAt: Date.now(),
          });
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err.message || "Failed to generate recommendations",
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [state.payload]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => setState({ status: "idle", payload: null, error: null, retryCount: 0 }), []);

  return { ...state, fetchRecommendations, cancel, reset };
}