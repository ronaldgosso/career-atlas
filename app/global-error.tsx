"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error Boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-5 text-center max-w-md p-8 rounded-3xl border border-teal-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Application Error
            </h2>
            <p className="text-xs text-teal-200/60 leading-relaxed">
              An unexpected error occurred during rendering. You can retry to reload the session.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => reset()}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-neutral-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Reload App
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
