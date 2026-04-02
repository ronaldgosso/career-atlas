"use client";

import { type RecommendationPayload } from "@/lib/validators";

type Tab = "books" | "videos" | "projects" | "online_resources";
const TABS: { key: Tab; label: string }[] = [
    { key: "books", label: "Books" },
    { key: "videos", label: "Video Tutorials" },
    { key: "projects", label: "Hands-On Projects" },
    { key: "online_resources", label: "Learning Sites" },
];

export function RecommendationsDashboard({ payload }: { payload: RecommendationPayload | null }) {
    if (!payload) return null;

    const { books, videos, projects, online_resources, professional_titles, metadata } = payload;
    const dataMap: Record<Tab, RecommendationPayload["books"] | RecommendationPayload["videos"] | RecommendationPayload["projects"] | RecommendationPayload["online_resources"]> = { books, videos, projects, online_resources };

    return (
        <div className="space-y-4 rounded-lg border border-neutral-800 bg-[var(--bg-surface)] p-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs text-[var(--text-muted)]">Region: {metadata.region}</span>
                <span className="text-xs text-[var(--text-muted)]">Generated: {new Date(metadata.generated_at).toLocaleDateString()}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {TABS.map(({ key, label }) => (
                    <section key={key} className="space-y-2">
                        <h3 className="text-sm font-semibold text-[var(--accent)]">{label}</h3>
                        <ul className="space-y-2">
                            {(dataMap[key] || []).map((item, i) => (
                                <li key={i} className="rounded border border-neutral-800 bg-[var(--bg-primary)]/50 p-3 text-xs text-[var(--text-primary)]">
                                    <span className="block font-medium text-white">{item.title}</span>
                                    <span className="text-[var(--text-muted)]">{item.detail}</span>
                                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-blue-400 hover:underline">View Resource →</a>}
                                    <p className="mt-1 text-[var(--text-muted)] italic">{item.reason}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {professional_titles && (
                <div className="mt-2 border-t border-neutral-800 pt-3">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Salary Expectancy ({metadata.currency_symbol})</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {professional_titles.map((t, i) => (
                            <div key={i} className="rounded bg-neutral-900 p-2 text-center text-xs">
                                <span className="block font-medium">{t.title}</span>
                                <span className="text-[var(--accent)]">{t.salary_range}</span>
                                <span className="block text-[var(--text-muted)] mt-0.5">{t.level}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}