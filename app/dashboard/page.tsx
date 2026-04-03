"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedRecommendations, deleteRecommendation } from "@/lib/cache-manager";
import { type RecommendationRecord } from "@/lib/db";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";
import { CacheControls } from "@/components/cache-controls";
import { OfflineIndicator } from "@/components/offline-indicator";
import { exportRecommendationToPDF } from "@/lib/pdf-export";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offline Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Review locally cached recommendations. Zero network required.</p>
        </div>
        <CacheControls records={records} />
      </div>

      <OfflineIndicator />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-900" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-[var(--bg-surface)] p-8 text-center">
          <p className="text-lg font-medium text-[var(--text-primary)]">No cached data yet</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Generate recommendations on the <Link href="/" className="text-blue-400 hover:underline">home page</Link> to populate your offline library.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <article key={record.id} className="rounded-lg border border-neutral-800 bg-[var(--bg-surface)] overflow-hidden transition-all">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{record.field}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {record.location?.city || "Unknown Region"} &bull; {new Date(record.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {expandedId === record.id ? "Collapse" : "View Details"}
                  </button>
                  {expandedId === record.id && record.data && (
                    <button
                      onClick={() => {
                        exportRecommendationToPDF(record.data!, record.location.city, record.field, record.generatedAt);
                      }}
                      className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Export PDF
                    </button>
                  )}
                  <button onClick={() => handleDelete(record.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === record.id && activePayload && activeRecord && (
                <div className="border-t border-neutral-800 bg-[var(--bg-primary)]/40 p-4">
                  <RecommendationsDashboard
                    payload={activePayload}
                    region={activeRecord.location.city}
                    field={activeRecord.field}
                    generatedAt={activeRecord.generatedAt}
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
