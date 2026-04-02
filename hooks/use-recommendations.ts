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

            if (!res.ok) {
                throw new Error(res.statusText || "Network response failed");
            }

            const data: RecommendationPayload = await res.json();

            setState({ status: "success", payload: data, error: null, retryCount: 0 });

            // Persist to IndexedDB for offline dashboard
            if (data) {
                const db = await getDB();
                await db.put("recommendations", {
                    id: `${location.city}-${field}-${Date.now()}`,
                    location,
                    field,
                    data: data,
                    generatedAt: Date.now(),
                });
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
    }, []);

    const cancel = useCallback(() => abortRef.current?.abort(), []);
    const reset = useCallback(() => setState({ status: "idle", payload: null, error: null, retryCount: 0 }), []);

    return { ...state, fetchRecommendations, cancel, reset };
}