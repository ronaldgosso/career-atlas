"use client";

import { useLocation } from "@/hooks/use-location";

export default function Home() {
  const { status, data, message } = useLocation();

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Locate. Select. Build.
        </h1>
        <p className="text-[var(--text-muted)] max-w-lg">
          We silently detect your region to tailor university-aligned career resources.
          All data stays on your device.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-3 text-sm">
          {status === "idle" && <span className="text-[var(--text-muted)]">Initializing resolver...</span>}
          {status === "resolving" && <span className="text-[var(--accent)]">Detecting ambient location...</span>}
          {status === "resolved" && (
            <span className="text-green-400">Resolved: {data?.city}, {data?.country}</span>
          )}
          {status === "fallback" && (
            <span className="text-yellow-400">Network fallback: {data?.city}, {data?.country}</span>
          )}
          {status === "error" && <span className="text-red-400">Location unavailable</span>}
        </div>
        {message && <p className="mt-2 text-xs text-[var(--text-muted)] italic">{message}</p>}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {["Books", "Videos", "Projects", "Sites", "Titles & Salary"].map((cat) => (
          <div key={cat} className="rounded-md border border-neutral-800 bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-muted)] opacity-40">
            {cat} (Pending selection)
          </div>
        ))}
      </div>
    </section>
  );
}