"use client";

import { useState, useCallback, useRef } from "react";
import { GeoData, type RecommendationPayload } from "@/lib/validators";
import { getValidCachedRecommendation, saveRecommendationToDB } from "@/lib/cache-manager";
import type { RecommendationRecord } from "@/lib/db";

export type ErrorSource = "mistral" | "gemini" | "network" | "validation" | "unknown";

type Status = "idle" | "loading" | "streaming" | "success" | "error";

interface RecState {
    status: Status;
    payload: RecommendationPayload | null;
    error: string | null;
    errorSource: ErrorSource;
    errorDetails: string | null;
    retryCount: number;
    warnings: string[];
    isFromCache?: boolean;
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
        isFromCache: false,
    });
    const abortRef = useRef<AbortController | null>(null);

    const fetchRecommendations = useCallback(async (location: GeoData, field: string, useGemini = false, forceRefresh = false) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // 1. Check offline cache (1-hour TTL) before making network request
        if (!forceRefresh) {
            try {
                const cached = await getValidCachedRecommendation(location, field);
                if (cached && cached.data) {
                    setState({
                        status: "success",
                        payload: cached.data,
                        error: null,
                        errorSource: "unknown",
                        errorDetails: null,
                        warnings: cached.data.metadata?.warnings || [],
                        retryCount: 0,
                        isFromCache: true,
                    });
                    return;
                }
            } catch (cacheErr) {
                console.warn("[Offline Cache Check Failed]", cacheErr);
            }
        }

        setState((prev) => ({
            ...prev,
            status: "loading",
            payload: null,
            error: null,
            errorSource: "unknown",
            errorDetails: null,
            warnings: [],
            retryCount: 0,
            isFromCache: false,
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
                    isFromCache: false,
                }));
                return;
            }

            const data: RecommendationPayload = body;

            // Check for partial success warnings
            const warnings = data?.metadata?.warnings || [];

            setState({
                status: "success",
                payload: data,
                error: null,
                errorSource: "unknown",
                errorDetails: null,
                warnings,
                retryCount: 0,
                isFromCache: false,
            });

            // Persist to IndexedDB for 1-hour offline cache & offline dashboard
            if (data) {
                try {
                    await saveRecommendationToDB(location, field, data);
                } catch (saveErr) {
                    console.warn("[Failed to cache recommendation]", saveErr);
                }
            }
        } catch (err: unknown) {
            const errorObj = err as { name?: string; message?: string };
            if (errorObj?.name === "AbortError") return;
            setState((prev) => ({
                ...prev,
                status: "error",
                error: errorObj?.message || "Unable to compile career recommendations at this time",
                errorSource: "network",
                errorDetails: null,
                retryCount: prev.retryCount + 1,
                isFromCache: false,
            }));
        }
    }, []);

    const loadCachedPayload = useCallback((record: RecommendationRecord) => {
        if (abortRef.current) abortRef.current.abort();
        setState({
            status: "success",
            payload: record.data,
            error: null,
            errorSource: "unknown",
            errorDetails: null,
            warnings: record.data?.metadata?.warnings || [],
            retryCount: 0,
            isFromCache: true,
        });
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
        isFromCache: false,
    }), []);

    return { ...state, fetchRecommendations, loadCachedPayload, cancel, reset };
}
