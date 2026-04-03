"use client";

import { useState, useCallback, useRef } from "react";
import { GeoData, type RecommendationPayload } from "@/lib/validators";
import { getDB } from "@/lib/db";

export type ErrorSource = "huggingface" | "gemini" | "network" | "validation" | "unknown";

type Status = "idle" | "loading" | "streaming" | "success" | "error";

interface RecState {
    status: Status;
    payload: RecommendationPayload | null;
    error: string | null;
    errorSource: ErrorSource;
    errorDetails: string | null;
    retryCount: number;
    warnings: string[];
}

export function useRecommendations() {
    const [state, setState] = useState<RecState>({
        status: "idle",
        payload: null,
        error: null,
        errorSource: "unknown",
        errorDetails: null,
        retryCount: 0,
        warnings: [],
    });
    const abortRef = useRef<AbortController | null>(null);

    const fetchRecommendations = useCallback(async (location: GeoData, field: string, useGemini = false) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setState((prev) => ({
            ...prev,
            status: "loading",
            payload: null,
            error: null,
            errorSource: "unknown",
            errorDetails: null,
            warnings: [],
            retryCount: 0,
        }));

        try {
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location, field, use_gemini: useGemini }),
                signal: controller.signal,
            });

            const body = await res.json().catch(() => null);

            if (!res.ok) {
                const errMsg = typeof body?.error === "string" && body.error ? body.error : res.statusText || "Network response failed";
                const source: ErrorSource = body?.source || "network";
                const details: string | null = body?.details || null;
                setState((prev) => ({
                    ...prev,
                    status: "error",
                    error: errMsg,
                    errorSource: source,
                    errorDetails: details,
                    retryCount: prev.retryCount + 1,
                }));
                return;
            }

            const data: RecommendationPayload = body;

            // Check for partial success warnings
            const warnings = data?.metadata?.warnings || [];

            setState((prev) => ({
                ...prev,
                status: "success",
                payload: data,
                error: null,
                errorSource: "unknown",
                errorDetails: null,
                warnings,
                retryCount: 0,
            }));

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
                errorSource: "network",
                errorDetails: null,
                retryCount: prev.retryCount + 1,
            }));
        }
    }, []);

    const cancel = useCallback(() => abortRef.current?.abort(), []);
    const reset = useCallback(() => setState({
        status: "idle",
        payload: null,
        error: null,
        errorSource: "unknown",
        errorDetails: null,
        retryCount: 0,
        warnings: [],
    }), []);

    return { ...state, fetchRecommendations, cancel, reset };
}
