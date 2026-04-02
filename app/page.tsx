"use client";

import { useLocation } from "@/hooks/use-location";
import { useRecommendations } from "@/hooks/use-recommendations";
import { LocationSwitcher } from "@/components/location-switcher";
import { FieldSelector } from "@/components/field-selector";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";

export default function Home() {
  const { status, data } = useLocation();
  const { status: recStatus, payload, error, fetchRecommendations, cancel, reset, retryCount } = useRecommendations();

  const handleFieldSelect = (field: string) => {
    if (data) fetchRecommendations(data, field);
  };

  const isReady = status === "resolved" || status === "fallback";

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Locate. Select. Build.</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Region: {data ? `${data.city}, ${data.countryCode}` : "Detecting..."}</p>
        </div>
        <LocationSwitcher />
      </div>

      {!isReady ? (
        <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
      ) : (
        <>
          <FieldSelector onFieldSelect={handleFieldSelect} />

          {recStatus === "loading" && (
            <div className="text-sm text-[var(--accent)] animate-pulse">Contacting AI model...</div>
          )}
          {recStatus === "streaming" && (
            <div className="space-y-2">
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-neutral-800">
                <div className="h-2 w-2/3 animate-[pulse_1.5s_ease-in-out_infinite] bg-[var(--accent)] rounded-full" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Parsing structured response...</p>
              <button onClick={cancel} className="text-xs text-red-400 hover:underline">Cancel</button>
            </div>
          )}
          {recStatus === "error" && (
            <div className="rounded-md border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
              <p>{error}</p>
              <button onClick={() => handleFieldSelect("IT")} className="mt-2 text-xs text-red-300 underline">
                Retry ({retryCount})
              </button>
            </div>
          )}

          {recStatus === "success" && payload && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-400 font-medium">✓ Recommendations generated & cached locally</span>
                <button onClick={reset} className="text-xs text-[var(--text-muted)] hover:text-white">Clear</button>
              </div>
              <RecommendationsDashboard payload={payload} />
            </div>
          )}
        </>
      )}
    </section>
  );
}