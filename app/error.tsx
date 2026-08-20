"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h2 className="text-xl font-bold tracking-tight text-white">Something went wrong</h2>
        <p className="text-xs text-teal-200/60 leading-relaxed">
          An unexpected error occurred while loading this view. You can safely retry without losing local cache data.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}