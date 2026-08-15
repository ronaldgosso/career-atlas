"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedRecommendations, deleteRecommendation } from "@/lib/cache-manager";
import { type RecommendationRecord } from "@/lib/db";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";
import { CacheControls } from "@/components/cache-controls";
import { OfflineIndicator } from "@/components/offline-indicator";
import { LocationSwitcher } from "@/components/location-switcher";
import { exportRecommendationToPDF } from "@/lib/pdf-export";
import { FolderOpen, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [records, setRecords] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadCache = useCallback(async () => {
    setLoading(true);
    const data = await getCachedRecommendations();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadCache(); }, [loadCache]);

  const handleDelete = async (id: string) => {
    await deleteRecommendation(id);
    if (expandedId === id) setExpandedId(null);
    await loadCache();
  };

  const activePayload = records.find(r => r.id === expandedId)?.data || null;
  const activeRecord = records.find(r => r.id === expandedId) || null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      {/* Executive Header Banner */}
      <div className="rounded-3xl border border-teal-500/20 bg-slate-950/80 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-300 hover:bg-teal-900/60 hover:text-white transition-all shadow-sm"
              title="Back to Career Atlas"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  Talent Dossier Vault
                </h1>
                <span className="rounded-full bg-teal-500/10 border border-teal-500/25 px-2.5 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                  Offline Cache
                </span>
              </div>
              <p className="text-xs text-teal-200/60 mt-0.5">
                Review, export, and manage locally cached candidate career intelligence. Zero network required.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LocationSwitcher />
          <CacheControls records={records} />
        </div>
      </div>

      <OfflineIndicator />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-900/60 border border-teal-500/10" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl border border-teal-500/20 bg-slate-950/60 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4">
            <FolderOpen className="h-7 w-7" />
          </div>
          <p className="text-lg font-bold text-white">No cached dossiers found</p>
          <p className="mt-1.5 text-xs text-teal-200/60 max-w-md mx-auto">
            Generate career recommendations on the home page to populate your offline talent intelligence vault.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-teal-500/20"
          >
            Explore Career Fields →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <article
              key={record.id}
              className="rounded-3xl border border-teal-500/15 bg-slate-950/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-teal-400/30 hover:shadow-xl hover:shadow-teal-500/5"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-white">{record.field}</h3>
                    <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                      {record.location?.city || "Unknown Region"}
                    </span>
                  </div>
                  <p className="text-xs text-teal-200/50 mt-1">
                    Generated: {new Date(record.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="rounded-xl border border-teal-500/30 bg-teal-950/40 px-3.5 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 hover:text-white transition-all"
                  >
                    {expandedId === record.id ? "Hide Details" : "Inspect Dossier"}
                  </button>
                  {expandedId === record.id && record.data && (
                    <button
                      onClick={() => {
                        exportRecommendationToPDF(record.data!, record.location.city, record.field, record.generatedAt);
                      }}
                      className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow-sm"
                    >
                      Export PDF
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="rounded-xl border border-rose-500/20 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === record.id && activePayload && activeRecord && (
                <div className="border-t border-teal-500/15 bg-slate-950/90 p-4 sm:p-6">
                  <RecommendationsDashboard
                    payload={activePayload}
                    region={activeRecord.location.city}
                    field={activeRecord.field}
                    generatedAt={activeRecord.generatedAt}
                    isFromCache={true}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

