"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCachedRecommendations, deleteRecommendation } from "@/lib/cache-manager";
import { type RecommendationRecord } from "@/lib/db";
import { RecommendationsDashboard } from "@/components/recommendations-dashboard";
import { CacheControls } from "@/components/cache-controls";
import { OfflineIndicator } from "@/components/offline-indicator";

const LEVEL_BADGE_CLASS: Record<string, string> = {
  Entry: "print-badge-entry",
  "Mid-Level": "print-badge-mid",
  Senior: "print-badge-senior",
  Lead: "print-badge-lead",
};

function PrintableReport({ records }: { records: RecommendationRecord[] }) {
  return (
    <div className="printable hidden" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif', padding: "24px 32px", background: "white", color: "#111" }}>
      {/* Header */}
      <div className="print-header" style={{ textAlign: "center", marginBottom: 24, paddingBottom: 12, borderBottom: "2px solid #333" }}>
        <h1 style={{ border: "none", fontSize: 28, margin: 0 }}>Career Atlas</h1>
        <p className="print-meta" style={{ fontSize: 12, color: "#777", margin: "4px 0 0" }}>
          Career Resource Report &bull; Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Records */}
      {records.map((record, recordIndex) => {
        const payload = record.data;
        if (!payload) return null;

        const categories: [string, string][] = [
          ["books", "📚 Books"],
          ["videos", "🎬 Video Tutorials"],
          ["projects", "💻 Projects"],
          ["online_resources", "🎓 Online Courses & Resources"],
          ["professional_titles", "💼 Professional Titles & Salaries"],
        ];

        return (
          <div key={record.id} className="print-section" style={{ marginBottom: 24, pageBreakInside: "avoid" }}>
            <h2 style={{ fontSize: 18, color: "#333", borderBottom: "1px solid #ddd", paddingBottom: 4, marginBottom: 4 }}>
              {record.field}
            </h2>
            <p className="print-meta" style={{ fontSize: 11, color: "#999", marginBottom: 12 }}>
              {record.location?.city || "Unknown"}, {record.location?.country || ""} &bull; {new Date(record.generatedAt).toLocaleString()}
            </p>

            {categories.map(([key, label]) => {
              const items = key === "professional_titles"
                ? payload.professional_titles
                : payload[key as keyof typeof payload] || [];

              if (!Array.isArray(items) || items.length === 0) return null;

              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div className="print-section-title" style={{ fontSize: 13, fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: 4, marginBottom: 8 }}>
                    {label}
                  </div>
                  {key === "professional_titles"
                    ? (items as { title: string; level: string; salary_range: string; reason: string }[]).map((item, i) => (
                      <div key={i} className="print-card" style={{ border: "1px solid #ddd", borderRadius: 4, padding: "8px 12px", marginBottom: 6, pageBreakInside: "avoid" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="print-card-title" style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
                          <span className={`print-badge ${LEVEL_BADGE_CLASS[item.level] || ""}`} style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 999, border: "1px solid #ccc" }}>
                            {item.level}
                          </span>
                        </div>
                        <div className="print-salary" style={{ fontSize: 15, fontWeight: 700, margin: "4px 0" }}>{item.salary_range}</div>
                        <p className="print-card-reason" style={{ fontSize: 11, color: "#666", fontStyle: "italic", margin: 0 }}>{item.reason}</p>
                      </div>
                    ))
                    : (items as { title: string; detail: string; url: string | null; reason: string }[]).map((item, i) => (
                      <div key={i} className="print-card" style={{ border: "1px solid #ddd", borderRadius: 4, padding: "8px 12px", marginBottom: 6, pageBreakInside: "avoid" }}>
                        <p className="print-card-title" style={{ fontWeight: 600, fontSize: 13, margin: "0 0 2px" }}>{item.title}</p>
                        <p className="print-card-detail" style={{ fontSize: 11, color: "#555", margin: "0 0 2px" }}>{item.detail}</p>
                        {item.url && <a href={item.url} style={{ fontSize: 10, color: "#2563eb", textDecoration: "none" }}>{item.url}</a>}
                        <p className="print-card-reason" style={{ fontSize: 11, color: "#666", fontStyle: "italic", margin: "4px 0 0" }}>{item.reason}</p>
                      </div>
                    ))
                  }
                </div>
              );
            })}

            {recordIndex < records.length - 1 && <hr style={{ border: "none", borderTop: "2px solid #eee", margin: "24px 0" }} />}
          </div>
        );
      })}

      {/* Footer */}
      <div className="print-footer" style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 24, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <p style={{ margin: 0 }}>Generated by Career Atlas &bull; <a href="https://github.com/ronaldgosso" style={{ color: "#2563eb" }}>Ronald Gosso</a></p>
      </div>
    </div>
  );
}

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

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const activePayload = records.find(r => r.id === expandedId)?.data || null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      {/* Print layout (hidden on screen, visible when printing) */}
      <PrintableReport records={records} />

      {/* On-screen UI */}
      <div className="no-print">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Offline Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Review locally cached recommendations. Zero network required.</p>
          </div>
          <CacheControls records={records} onExportPDF={handleExportPDF} />
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {expandedId === record.id ? "Collapse" : "View Details"}
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                {expandedId === record.id && activePayload && (
                  <div className="border-t border-neutral-800 bg-[var(--bg-primary)]/40 p-4">
                    <RecommendationsDashboard payload={activePayload} region={record.location.city} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
