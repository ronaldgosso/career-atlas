"use client";

import { useRef, useEffect } from "react";
import { useState } from "react";
import { useLocation } from "@/hooks/use-location";
import { useRecommendations } from "@/hooks/use-recommendations";
import { FieldSelector } from "@/components/field-selector";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";
import { LoadingOrb } from "@/components/loading-orb";

const ERROR_CONFIG: Record<string, { icon: string; color: string; bg: string; borderColor: string; title: string; actionLabel: string }> = {
  mistral: {
    icon: "🌪️",
    color: "text-amber-400",
    bg: "bg-amber-950/20",
    borderColor: "border-amber-500/20",
    title: "AI Model Error",
    actionLabel: "Retry",
  },
  gemini: {
    icon: "✨",
    color: "text-blue-400",
    bg: "bg-blue-950/20",
    borderColor: "border-blue-500/20",
    title: "Gemini Video Search Failed",
    actionLabel: "Retry without Gemini",
  },
  validation: {
    icon: "⚠️",
    color: "text-orange-400",
    bg: "bg-orange-950/20",
    borderColor: "border-orange-500/20",
    title: "Validation Error",
    actionLabel: "Retry",
  },
  network: {
    icon: "🌐",
    color: "text-red-400",
    bg: "bg-red-950/20",
    borderColor: "border-red-500/20",
    title: "Network Error",
    actionLabel: "Retry",
  },
};

export default function Home() {
  const [useGemini, setUseGemini] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { status, data } = useLocation();
  const { status: recStatus, payload, error, errorSource, errorDetails, warnings, isFromCache, fetchRecommendations, cancel, reset } = useRecommendations();

  const handleFieldSelect = (field: string, useGeminiVideos: boolean) => {
    if (data) fetchRecommendations(data, field, useGeminiVideos);
  };

  const isReady = status === "resolved" || status === "fallback";
  const isLoading = recStatus === "loading";

  // Auto-scroll to loading/results section when fetch starts
  useEffect(() => {
    if (isLoading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isLoading]);

  return (
    <section className="relative mx-auto min-h-screen max-w-5xl px-4 py-8">
      {/* Animated background - Deep ocean obsidian theme */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-[#07131e] to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.08),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Executive Header Banner */}
        <header className="rounded-3xl border border-teal-500/20 bg-slate-950/70 p-6 backdrop-blur-xl shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 shadow-lg shadow-teal-500/25">
                <svg className="h-6 w-6 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    Career Atlas
                  </h1>
                  <span className="rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                    AI Recruiter Intel
                  </span>
                </div>
                <p className="text-xs text-teal-200/60 mt-0.5">
                  Market-calibrated hiring benchmarks, capstones, & competencies
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-teal-500/20 px-3 py-1.5 text-xs text-teal-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {data ? `${data.city}, ${data.countryCode}` : "Detecting Location..."}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-teal-500/10 bg-slate-950/40 backdrop-blur-md">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500/20 border-t-teal-400 shadow-lg shadow-teal-500/20" />
            <p className="mt-5 text-sm font-medium text-teal-200">Calibrating regional talent market...</p>
            <p className="text-xs text-teal-300/50 mt-1">Resolving GPS coordinates & regional database</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Field Selector */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-teal-950/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <FieldSelector
                onFieldSelect={handleFieldSelect}
                useGemini={useGemini}
                onGeminiToggle={() => setUseGemini((v) => !v)}
                disabled={isLoading}
              />
            )}

            {/* Scroll Target - Loading / Error / Results */}
            <div ref={resultsRef} className="space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-slate-950/80 p-10 backdrop-blur-xl shadow-2xl">
                  <div className="flex flex-col items-center space-y-6">
                    <LoadingOrb />
                    <div className="space-y-2.5 text-center">
                      <p className="text-xl font-extrabold text-white animate-pulse">
                        Synthesizing Executive Career Dossier...
                      </p>
                      <p className="text-sm text-teal-200/70">
                        Analyzing live compensation benchmarks & competency roadmaps for {data?.city || "your market"}
                      </p>
                      <div className="flex items-center justify-center gap-2.5 text-xs text-teal-300/60 pt-1">
                        <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 font-mono text-[11px] text-teal-300">
                          Mistral AI Neural Engine
                        </span>
                        <span>•</span>
                        <span>Multi-category Parallel Synthesis</span>
                      </div>
                    </div>
                    {/* Wave progress indicator */}
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-12 rounded-full bg-teal-400/40 animate-[pulse_1s_ease-in-out_infinite]"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={cancel}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 font-medium"
                    >
                      Cancel request
                    </button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {recStatus === "error" && (() => {
                const cfg = ERROR_CONFIG[errorSource] || ERROR_CONFIG.network;
                const retryGeminiOff = errorSource === "gemini";
                return (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`rounded-xl border ${cfg.borderColor} ${cfg.bg} p-6 backdrop-blur-sm`}>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                          {cfg.icon}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className={`font-semibold ${cfg.color}`}>{cfg.title}</h3>
                            <p className="mt-1.5 text-sm text-neutral-300/80 leading-relaxed">{error}</p>
                            {errorDetails && (
                              <p className="mt-1 text-xs text-neutral-400/60 font-mono bg-black/20 rounded-lg px-3 py-2">{errorDetails}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFieldSelect("IT", retryGeminiOff ? false : useGemini)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${cfg.bg.replace("/20", "/30")} ${cfg.color.replace("text-", "text-")} border ${cfg.borderColor} hover:brightness-125`}
                            >
                              {cfg.actionLabel} {retryGeminiOff && <span className="text-xs opacity-60">(Mistral fallback)</span>}
                            </button>
                            {errorSource === "mistral" && (
                              <a
                                href="https://console.mistral.ai/api-keys/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-neutral-400 hover:text-neutral-300 underline underline-offset-2"
                              >
                                Check API key
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Partial Success Warnings */}
              {recStatus === "success" && payload && warnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-amber-300">Some services had issues</p>
                      <ul className="mt-1 text-xs text-amber-200/60 space-y-1">
                        {warnings.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State - Dashboard */}
              {recStatus === "success" && payload && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <RecommendationsDashboard
                    payload={payload}
                    onReset={reset}
                    region={data?.city || "your city"}
                    field={payload.metadata?.region?.split(",")[0].trim() || data?.city || ""}
                    generatedAt={Date.now()}
                    usedGemini={useGemini}
                    isFromCache={isFromCache}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
