"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Database, 
  X, 
  Search, 
  Trash2, 
  Download, 
  FileDown, 
  Eye, 
  MapPin, 
  Clock, 
  Briefcase, 
  Code2, 
  BookOpen,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { getCachedRecommendations, deleteRecommendation, clearAllRecommendations, exportToJSON } from "@/lib/cache-manager";
import type { RecommendationRecord } from "@/lib/db";
import { exportRecommendationToPDF } from "@/lib/pdf-export";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: RecommendationRecord) => void;
  onCacheUpdated?: () => void;
}

export function CachedResultsModal({ isOpen, onClose, onSelectRecord, onCacheUpdated }: Props) {
  const [records, setRecords] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCachedRecommendations();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load cached recommendations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
      setConfirmClear(false);
      setSearchQuery("");
    }
  }, [isOpen, loadRecords]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteRecommendation(id);
    await loadRecords();
    onCacheUpdated?.();
  };

  const handleClearAll = async () => {
    await clearAllRecommendations();
    setConfirmClear(false);
    await loadRecords();
    onCacheUpdated?.();
  };

  const handleExportJSON = () => {
    const json = exportToJSON(records);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-atlas-cache-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fieldMatch = r.field.toLowerCase().includes(q);
    const cityMatch = (r.location?.city || "").toLowerCase().includes(q);
    const countryMatch = (r.location?.country || "").toLowerCase().includes(q);
    return fieldMatch || cityMatch || countryMatch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-teal-500/30 bg-slate-950 shadow-2xl shadow-teal-500/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex flex-col gap-4 border-b border-teal-500/20 bg-slate-900/80 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Cached Dossiers Vault
                  </h2>
                  <span className="rounded-full bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                    {records.length} {records.length === 1 ? "Record" : "Records"}
                  </span>
                </div>
                <p className="text-xs text-teal-200/60 mt-0.5">
                  Locally stored career intelligence. Ready for instant offline retrieval.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-700/50 bg-slate-900/80 p-2 text-neutral-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-teal-400/50 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by field or city..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-teal-500/20 bg-slate-950/80 text-xs text-teal-100 placeholder-teal-300/40 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-teal-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {records.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-teal-950/40 px-3 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 hover:text-white transition-all"
                  title="Export all records as JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>

                {confirmClear ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={handleClearAll}
                      className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
                    >
                      Confirm Clear
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="rounded-xl border border-neutral-700 bg-slate-900 px-2.5 py-2 text-xs text-neutral-300 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-950/20 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-900/40 hover:text-rose-300 transition-colors"
                    title="Clear all stored recommendations"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Body / Records List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-teal-500/10 animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4">
                <FolderOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">No cached dossiers yet</h3>
              <p className="mt-1 text-xs text-teal-200/60 max-w-sm">
                Select any career field on the home page to automatically cache calibrated compensation, capstone projects, and curricula.
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-10 text-center text-xs text-teal-200/60">
              No cached records match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredRecords.map((record) => {
              const rolesCount = record.data?.professional_titles?.length || 0;
              const capstonesCount = record.data?.projects?.length || 0;
              const dateStr = new Date(record.generatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectRecord(record);
                    onClose();
                  }}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-teal-500/15 bg-slate-900/60 p-4 transition-all duration-200 hover:border-teal-400/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-teal-500/5 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {record.field}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                        <MapPin className="h-2.5 w-2.5" />
                        {record.location?.city || "Unknown Region"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-teal-200/60">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-teal-400/60" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-teal-300/80">
                        <Briefcase className="h-3 w-3" />
                        {rolesCount} Roles
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-cyan-300/80">
                        <Code2 className="h-3 w-3" />
                        {capstonesCount} Capstones
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (record.data) {
                          exportRecommendationToPDF(
                            record.data,
                            record.location?.city || "Region",
                            record.field,
                            record.generatedAt
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-teal-500/20 bg-teal-950/40 px-2.5 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 hover:text-white transition-colors"
                      title="Export as PDF"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, record.id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-1.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                      title="Delete from cache"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 group-hover:brightness-110 transition-all shadow-sm">
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-teal-500/15 bg-slate-900/60 px-6 py-3 flex items-center justify-between text-xs text-teal-200/50">
          <span>Click any cached dossier to view immediately</span>
          <span>IndexedDB Storage</span>
        </div>
      </div>
    </div>
  );
}
