"use client";

import { useLocation } from "@/hooks/use-location";
import { useRecommendations } from "@/hooks/use-recommendations";
import { FieldSelector } from "@/components/field-selector";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";
import { LoadingOrb } from "@/components/loading-orb";

export default function Home() {
  const { status, data } = useLocation();
  const { status: recStatus, payload, error, fetchRecommendations, cancel, reset, retryCount } = useRecommendations();

  const handleFieldSelect = (field: string) => {
    if (data) fetchRecommendations(data, field);
  };

  const isReady = status === "resolved" || status === "fallback";
  const isLoading = recStatus === "loading";

  return (
    <section className="relative mx-auto min-h-screen max-w-5xl px-4 py-8">
      {/* Animated background - Deep ocean theme */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,116,144,0.06),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl border border-teal-500/10 bg-teal-950/20 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/25">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 2l2.5 6.5H9.5L12 2z" fill="currentColor" />
                <path d="M12 22l2.5-6.5H9.5L12 22z" fill="currentColor" />
                <path d="M22 12l-6.5 2.5V9.5L22 12z" fill="currentColor" />
                <path d="M2 12l6.5 2.5V9.5L2 12z" fill="currentColor" />
                <path d="M19.07 4.93l-4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.93 19.07l4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M19.07 19.07l-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.93 4.93l4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Career Atlas</h1>
              <p className="text-xs text-teal-200/60">Navigate your professional journey</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500/20 border-t-teal-400" />
            <p className="mt-4 text-sm text-teal-200/60">Detecting your location...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Field Selector */}
            <FieldSelector
              onFieldSelect={handleFieldSelect}
              disabled={isLoading}
            />

            {/* Loading State */}
            {isLoading && (
              <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-teal-950/30 p-8 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-6">
                  <LoadingOrb />
                  <div className="space-y-3 text-center">
                    <p className="text-lg font-medium text-white animate-pulse">Crafting your career map...</p>
                    <p className="text-sm text-teal-200/60">Analyzing opportunities in {data?.city}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-teal-300/50">
                      <span className="rounded-full bg-teal-500/10 px-3 py-1">AI Processing</span>
                      <span>•</span>
                      <span>~15-30 seconds</span>
                    </div>
                  </div>
                  {/* Wave progress indicator */}
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-10 rounded-full bg-teal-500/20 animate-[pulse_1s_ease-in-out_infinite]"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={cancel}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4"
                  >
                    Cancel request
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {recStatus === "error" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                      <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-medium text-amber-400">Generation failed</h3>
                        <p className="mt-1 text-sm text-amber-200/70">{error}</p>
                      </div>
                      <button
                        onClick={() => handleFieldSelect("IT")}
                        className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30"
                      >
                        Retry with IT field (Attempt {retryCount})
                      </button>
                    </div>
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
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
