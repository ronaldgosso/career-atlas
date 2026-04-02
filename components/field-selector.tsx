"use client";

import { useState } from "react";

const FIELDS = [
  "Information Technology (IT)",
  "Data Science & Analytics",
  "Cybersecurity",
  "Software Engineering",
  "Cloud & DevOps",
  "UI/UX Design",
  "Product Management",
  "Machine Learning Engineering",
  "Network Administration",
  "Digital Marketing Tech",
];

export function FieldSelector({ onFieldSelect }: { onFieldSelect: (field: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Select Field</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {FIELDS.map((field) => (
          <button
            key={field}
            disabled={!!selected}
            onClick={() => { setSelected(field); onFieldSelect(field); }}
            className={`rounded-md border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40
              ${selected === field
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-neutral-800 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-neutral-600"
              }`}
          >
            {field}
          </button>
        ))}
      </div>
    </div>
  );
}