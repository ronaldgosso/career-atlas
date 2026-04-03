"use client";

import { useState } from "react";
import { clearAllRecommendations, exportToJSON } from "@/lib/cache-manager";
import type { RecommendationRecord } from "@/lib/db";

interface Props {
  records: RecommendationRecord[];
  onExportPDF?: () => void;
}

export function CacheControls({ records, onExportPDF }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    const json = exportToJSON(records);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-atlas-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearAllRecommendations();
    setConfirmClear(false);
    window.location.reload();
  };

  if (records.length === 0) return null;

  return (
    <div className="flex gap-3 items-center flex-wrap">
      <button
        onClick={handleExport}
        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
      >
        Export JSON
      </button>
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
        >
          Export PDF
        </button>
      )}
      {confirmClear ? (
        <div className="flex gap-2 items-center text-xs">
          <button onClick={handleClear} className="font-medium text-red-400 hover:text-red-300">Confirm Clear</button>
          <button onClick={() => setConfirmClear(false)} className="text-neutral-400 hover:text-neutral-300">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmClear(true)}
          className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
        >
          Clear Cache
        </button>
      )}
    </div>
  );
}
