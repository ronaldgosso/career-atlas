"use client";

import { useState } from "react";
import { type RecommendationPayload } from "@/lib/validators";
import { exportRecommendationToPDF } from "@/lib/pdf-export";

type Tab = "books" | "videos" | "projects" | "online_resources" | "professional_titles";
const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "books", label: "Books", icon: "📚" },
    { key: "videos", label: "Videos", icon: "🎬" },
    { key: "projects", label: "Projects", icon: "💻" },
    { key: "online_resources", label: "Courses", icon: "🎓" },
    { key: "professional_titles", label: "Salaries", icon: "💼" },
];

interface Props {
    payload: RecommendationPayload;
    onReset?: () => void;
    region: string;
    field?: string;
    generatedAt?: number;
    usedGemini?: boolean;
    isFromCache?: boolean;
}

export function RecommendationsDashboard({ payload, onReset, region, field, generatedAt, usedGemini = false, isFromCache = false }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("books");

    const handleExportPDF = () => {
        exportRecommendationToPDF(payload, region, field || region, generatedAt || Date.now());
    };

    const { books, videos, projects, online_resources, professional_titles, metadata } = payload;

    const renderContent = () => {
        switch (activeTab) {
            case "professional_titles":
                return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {professional_titles.map((item, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-xl border border-teal-500/10 bg-gradient-to-br from-teal-950/30 to-cyan-950/30 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-teal-50">{item.title}</h4>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.level === "Entry" ? "bg-teal-500/10 text-teal-300" :
                                            item.level === "Mid-Level" ? "bg-cyan-500/10 text-cyan-300" :
                                                item.level === "Senior" ? "bg-amber-500/10 text-amber-300" :
                                                    "bg-rose-500/10 text-rose-300"
                                            }`}>
                                            {item.level}
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                                        {item.salary_range}
                                    </div>
                                    <p className="text-sm text-teal-100/60">{item.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            default:
                const items = activeTab === "books" ? books : activeTab === "videos" ? videos : activeTab === "projects" ? projects : online_resources;
                return (
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const showUrl = activeTab !== "projects";
                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-xl border border-teal-500/10 bg-teal-950/20 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/30 hover:bg-teal-900/30 hover:shadow-lg hover:shadow-cyan-500/5"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative flex gap-4">
                                        {/* Index badge */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 font-bold text-teal-300">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-teal-50 group-hover:text-cyan-300 transition-colors">
                                                    {item.title}
                                                </h4>
                                                {showUrl && item.url && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 transition-colors hover:bg-teal-500/20 hover:text-cyan-300"
                                                    >
                                                        Visit →
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-sm text-teal-100/60">{item.detail}</p>
                                            <div className="rounded-lg bg-teal-950/30 p-3">
                                                <p className="text-sm italic text-teal-50">
                                                    <span className="font-medium text-cyan-300">Why: </span>
                                                    {item.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Gemini hint when videos are AI-generated */}
                        {activeTab === "videos" && !usedGemini && (
                            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-950/20 px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                        <svg className="h-4 w-4 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-200/80">AI-generated video recommendations</p>
                                        <p className="text-xs text-blue-200/50 mt-0.5">
                                            These videos were suggested by AI and may not currently exist on YouTube. Enable Gemini for real-time YouTube search with verified, currently available videos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Gemini badge when used */}
                        {activeTab === "videos" && usedGemini && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-teal-200/50">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-300">
                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Gemini-powered
                                </span>
                                <span>Real YouTube search results</span>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-teal-500/10 bg-teal-950/20 shadow-2xl">
            {/* Header */}
            <div className="border-b border-teal-500/10 bg-teal-950/40 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
                            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-teal-50">Recommendations for {region}</p>
                                {isFromCache && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-medium text-teal-300">
                                        ⚡ Cached
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-teal-200/50">Generated {new Date(metadata.generated_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPDF}
                            className="rounded-lg border border-teal-500/20 bg-teal-950/30 px-4 py-2 text-xs font-medium text-teal-200/70 transition-colors hover:border-teal-500/30 hover:bg-teal-900/40 hover:text-teal-100"
                        >
                            Export PDF
                        </button>
                        {onReset && (
                            <button
                                onClick={onReset}
                                className="rounded-lg border border-teal-500/20 bg-teal-950/30 px-4 py-2 text-xs font-medium text-teal-200/70 transition-colors hover:border-teal-500/30 hover:bg-teal-900/40 hover:text-teal-100"
                            >
                                Start Over
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-teal-500/10 bg-teal-950/30">
                <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-thin scrollbar-track-teal-950 scrollbar-thumb-teal-700">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.key
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20"
                                    : "text-teal-200/60 hover:text-teal-100 hover:bg-teal-900/40"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {renderContent()}
                </div>
            </div>

            {/* Footer stats */}
            <div className="border-t border-teal-500/10 bg-teal-950/30 px-6 py-3">
                <div className="flex items-center justify-between text-xs text-teal-200/50">
                    <span>
                        {activeTab === "professional_titles"
                            ? `${professional_titles.length} career paths`
                            : `${(payload[activeTab as keyof RecommendationPayload] as unknown[] || []).length} resources curated`}
                    </span>
                    <span>Currency: {metadata.currency_symbol}</span>
                </div>
            </div>
        </div>
    );
}
