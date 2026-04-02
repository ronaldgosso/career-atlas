"use client";

import { useEffect } from "react";

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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
      <p className="text-sm text-[var(--text-muted)] max-w-md">
        An unexpected error occurred. This might be due to a corrupted local cache state.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
      >
        Try again
      </button>
    </div>
  );
}