"use client";

import { useState, useMemo } from "react";
import { type RecommendationPayload } from "@/lib/validators";
import { exportRecommendationToPDF } from "@/lib/pdf-export";

type Tab = "professional_titles" | "projects" | "books" | "videos" | "online_resources";

const TABS: { key: Tab; label: string; icon: string; subtitle: string }[] = [
    { key: "professional_titles", label: "Market Compensation & Roles", icon: "💼", subtitle: "Salary benchmarks & job levels" },
    { key: "projects", label: "Capstone Projects", icon: "💻", subtitle: "Recruiter-grade portfolio pieces" },
    { key: "books", label: "Curated Literature", icon: "📚", subtitle: "Verified books & deep-dive reading" },
    { key: "videos", label: "Masterclasses & Videos", icon: "🎬", subtitle: "Video tutorials & tech series" },
    { key: "online_resources", label: "Courses & Certifications", icon: "🎓", subtitle: "Specialized learning paths" },
];

const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string; barWidth: string }> = {
    Entry: { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-500/30", barWidth: "25%" },
    "Mid-Level": { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30", barWidth: "55%" },
    Senior: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30", barWidth: "80%" },
    Lead: { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/30", barWidth: "100%" },
};

interface Props {
    payload: RecommendationPayload;
    onReset?: () => void;
    region: string;
    field?: string;
    generatedAt?: number;
    usedGemini?: boolean;
    isFromCache?: boolean;
}

export function RecommendationsDashboard({
    payload,
    onReset,
    region,
    field,
    generatedAt,
    usedGemini = false,
    isFromCache = false,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("professional_titles");
    const [tabFilterQuery, setTabFilterQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>("All");
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [copiedDossier, setCopiedDossier] = useState(false);
    const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

    const { books, videos, projects, online_resources, professional_titles, metadata } = payload;
    const effectiveField = field || metadata.region || "Professional Discipline";

    // Toggle bookmark
    const toggleBookmark = (id: string) => {
        setBookmarkedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Calculate compensation range
    const salarySummary = useMemo(() => {
        if (!professional_titles || professional_titles.length === 0) return null;
        return {
            rolesCount: professional_titles.length,
            topRange: professional_titles[professional_titles.length - 1]?.salary_range || professional_titles[0]?.salary_range,
        };
    }, [professional_titles]);

    // Copy entire Recruiter Brief to clipboard
    const handleCopyDossier = () => {
        const lines: string[] = [
            `# 📋 CAREER ATLAS RECRUITER DOSSIER`,
            `**Discipline:** ${effectiveField}`,
            `**Target Market:** ${region}`,
            `**Generated:** ${new Date(metadata.generated_at).toLocaleDateString()}`,
            `\n## 💼 Market Compensation & Target Roles:`,
            ...professional_titles.map((p) => `- **${p.title}** (${p.level}): ${p.salary_range} — ${p.reason}`),
            `\n## 💻 Recommended Capstone Projects:`,
            ...projects.map((p) => `- **${p.title}**: ${p.detail} (Why: ${p.reason})`),
            `\n## 📚 Curated Literature:`,
            ...books.map((b) => `- **${b.title}** by ${b.detail} (${b.url})`),
            `\n## 🎓 Courses & Certifications:`,
            ...online_resources.map((c) => `- **${c.title}** (${c.detail})`),
        ];

        navigator.clipboard.writeText(lines.join("\n"));
        setCopiedDossier(true);
        setTimeout(() => setCopiedDossier(false), 2500);
    };

    // Copy Resume Impact bullet for a project
    const handleCopyResumeBullet = (project: { title: string; detail: string; reason: string }, idx: number) => {
        const bullet = `• Architected and developed ${project.title}, focusing on ${project.detail.toLowerCase()}, demonstrating ${project.reason.toLowerCase()}.`;
        navigator.clipboard.writeText(bullet);
        setCopiedBulletIndex(idx);
        setTimeout(() => setCopiedBulletIndex(null), 2500);
    };

    const handleExportPDF = () => {
        exportRecommendationToPDF(payload, region, effectiveField, generatedAt || Date.now());
    };

    // Filter items in active tab
    const filteredContent = useMemo(() => {
        const q = tabFilterQuery.toLowerCase().trim();

        if (activeTab === "professional_titles") {
            return professional_titles.filter((item) => {
                const matchesLevel = selectedLevel === "All" || item.level === selectedLevel;
                const matchesQuery =
                    !q ||
                    item.title.toLowerCase().includes(q) ||
                    item.salary_range.toLowerCase().includes(q) ||
                    item.reason.toLowerCase().includes(q);
                return matchesLevel && matchesQuery;
            });
        }

        const items =
            activeTab === "projects"
                ? projects
                : activeTab === "books"
                ? books
                : activeTab === "videos"
                ? videos
                : online_resources;

        if (!q) return items;
        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.detail.toLowerCase().includes(q) ||
                item.reason.toLowerCase().includes(q)
        );
    }, [activeTab, tabFilterQuery, selectedLevel, professional_titles, projects, books, videos, online_resources]);

    return (
        <div className="overflow-hidden rounded-3xl border border-teal-500/20 bg-slate-950/80 shadow-2xl backdrop-blur-xl transition-all">
            {/* ── Top Executive Briefing Header ── */}
            <div className="border-b border-teal-500/15 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Title & Metadata */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Talent Intel Map
                            </span>
                            {isFromCache && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                                    ⚡ 1h Cached
                                </span>
                            )}
                            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-xs text-teal-300 font-mono">
                                {region}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl text-gradient">
                            {effectiveField}
                        </h2>
                        <p className="text-xs text-teal-200/60 max-w-2xl">
                            Calibrated hiring standards, compensation benchmarks, and competency curriculum customized for the {region} market.
                        </p>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={handleCopyDossier}
                            className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/50 px-4 py-2.5 text-xs font-semibold text-teal-200 transition-all hover:bg-teal-900/60 hover:text-white hover:border-teal-400 active:scale-95 shadow-sm"
                        >
                            {copiedDossier ? (
                                <>
                                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Copied Dossier!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    <span>Copy Recruiter Brief</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:brightness-110 active:scale-95 shadow-md shadow-teal-500/20"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Export PDF Dossier</span>
                        </button>

                        {onReset && (
                            <button
                                onClick={onReset}
                                className="rounded-xl border border-neutral-700/60 bg-slate-900/50 p-2.5 text-xs text-neutral-400 transition-colors hover:text-white hover:bg-slate-800"
                                title="Start Over"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Recruiter KPI Snapshot Metrics ── */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                        <p className="text-[11px] font-medium text-teal-300/70">Top Market Compensation</p>
                        <p className="mt-1 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                            {salarySummary?.topRange || "Competitive"}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                        <p className="text-[11px] font-medium text-teal-300/70">Hiring Standard Roles</p>
                        <p className="mt-1 text-lg font-bold text-white">
                            {professional_titles.length} Standardized Tiers
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                        <p className="text-[11px] font-medium text-teal-300/70">Curated Portfolio Assets</p>
                        <p className="mt-1 text-lg font-bold text-white">
                            {projects.length} Capstone Ideas
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                        <p className="text-[11px] font-medium text-teal-300/70">Shortlisted / Bookmarked</p>
                        <p className="mt-1 text-lg font-bold text-amber-300">
                            {bookmarkedIds.size} Saved
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Executive Tab Navigation Bar ── */}
            <div className="border-b border-teal-500/10 bg-slate-950/90 px-4 py-3 sm:px-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const count =
                            tab.key === "professional_titles"
                                ? professional_titles.length
                                : (payload[tab.key as keyof RecommendationPayload] as unknown[] || []).length;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setTabFilterQuery("");
                                }}
                                className={`group relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-all duration-200 whitespace-nowrap focus:outline-none ${
                                    isActive
                                        ? "bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-transparent border border-teal-400/40 text-white shadow-lg shadow-teal-500/10"
                                        : "border border-transparent text-teal-200/60 hover:text-white hover:bg-slate-900/60"
                                }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold tracking-wide">{tab.label}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                                                isActive ? "bg-teal-400 text-slate-950" : "bg-slate-800 text-teal-300/60"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-teal-300/40 font-normal hidden sm:block">{tab.subtitle}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Interactive In-Tab Filter & Search Bar ── */}
            <div className="border-b border-teal-500/10 bg-slate-900/40 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <input
                        type="text"
                        value={tabFilterQuery}
                        onChange={(e) => setTabFilterQuery(e.target.value)}
                        placeholder={`Filter ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}...`}
                        className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-teal-500/20 bg-slate-950/80 text-xs text-teal-100 placeholder-teal-300/40 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                    <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-teal-400/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {tabFilterQuery && (
                        <button onClick={() => setTabFilterQuery("")} className="absolute right-2.5 top-1.5 text-xs text-teal-400 hover:text-white">
                            ✕
                        </button>
                    )}
                </div>

                {/* Level Filter for Salaries tab */}
                {activeTab === "professional_titles" && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-teal-300/60 font-medium mr-1">Seniority:</span>
                        {["All", "Entry", "Mid-Level", "Senior", "Lead"].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setSelectedLevel(lvl)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                    selectedLevel === lvl
                                        ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                                        : "bg-slate-950/80 text-teal-200/60 hover:text-white border border-teal-500/15"
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Main Tab Content ── */}
            <div className="p-6 sm:p-8">
                {filteredContent.length === 0 ? (
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/30 p-8 text-center">
                        <p className="text-sm font-medium text-teal-200">No matching items for &ldquo;{tabFilterQuery}&rdquo;</p>
                        <button onClick={() => setTabFilterQuery("")} className="mt-2 text-xs text-teal-400 hover:underline">
                            Clear filter
                        </button>
                    </div>
                ) : activeTab === "professional_titles" ? (
                    /* ── SALARIES & ROLES VIEW ── */
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {(filteredContent as typeof professional_titles).map((item, index) => {
                            const lvlCfg = LEVEL_CONFIG[item.level] || LEVEL_CONFIG.Entry;
                            const isBookmarked = bookmarkedIds.has(`title-${index}`);

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-gradient-to-br from-slate-900/80 to-teal-950/30 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative space-y-4">
                                        {/* Header & Bookmark */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${lvlCfg.bg} ${lvlCfg.text} ${lvlCfg.border}`}>
                                                    {item.level} Level
                                                </span>
                                                <h4 className="mt-2 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmark(`title-${index}`)}
                                                className={`text-lg transition-transform active:scale-125 ${isBookmarked ? "text-amber-400 scale-110" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Save to Shortlist"
                                            >
                                                ★
                                            </button>
                                        </div>

                                        {/* Compensation Callout & Progress */}
                                        <div className="rounded-xl border border-teal-500/15 bg-slate-950/60 p-4 space-y-2">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-[11px] uppercase font-mono text-teal-300/60">Estimated Benchmark</span>
                                                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-300">
                                                    {item.salary_range}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
                                                    style={{ width: lvlCfg.barWidth }}
                                                />
                                            </div>
                                        </div>

                                        {/* Recruiter Evaluation Reason */}
                                        <div className="space-y-1.5 text-xs text-teal-100/75 leading-relaxed">
                                            <p className="font-semibold text-teal-300 text-[11px] uppercase tracking-wider">Market Expectations:</p>
                                            <p>{item.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : activeTab === "projects" ? (
                    /* ── CAPSTONE & PORTFOLIO PROJECTS VIEW ── */
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {(filteredContent as typeof projects).map((item, index) => {
                            const isBookmarked = bookmarkedIds.has(`proj-${index}`);
                            const isCopied = copiedBulletIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-slate-900/70 p-6 transition-all duration-300 hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between"
                                >
                                    <div className="relative space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                                                <span>🚀 Capstone #{index + 1}</span>
                                            </span>
                                            <button
                                                onClick={() => toggleBookmark(`proj-${index}`)}
                                                className={`text-lg transition-transform active:scale-125 ${isBookmarked ? "text-amber-400 scale-110" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Save to Shortlist"
                                            >
                                                ★
                                            </button>
                                        </div>

                                        <div>
                                            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="mt-1 text-xs text-teal-200/70">{item.detail}</p>
                                        </div>

                                        <div className="rounded-xl border border-teal-500/15 bg-slate-950/60 p-3.5 space-y-1.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Recruiter Competency Validation:</p>
                                            <p className="text-xs text-teal-100/80 leading-relaxed italic">&ldquo;{item.reason}&rdquo;</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-3 border-t border-teal-500/10 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => handleCopyResumeBullet(item, index)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-950/40 px-3 py-1.5 text-[11px] font-semibold text-teal-300 transition-all hover:bg-teal-900/50 hover:text-white"
                                        >
                                            {isCopied ? "✓ Bullet Copied!" : "📋 Copy Resume Impact"}
                                        </button>
                                        {item.url && (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                                            >
                                                Repo / Guide →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── BOOKS / VIDEOS / COURSES VIEW ── */
                    <div className="space-y-3.5">
                        {(filteredContent as typeof books).map((item, index) => {
                            const isBookmarked = bookmarkedIds.has(`${activeTab}-${index}`);

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-slate-900/60 p-5 transition-all duration-300 hover:border-teal-400/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-teal-500/10"
                                >
                                    <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        {/* Content */}
                                        <div className="flex gap-4 items-start flex-1 min-w-0">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-sm font-bold text-teal-300 border border-teal-500/30">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    {activeTab === "books" && (
                                                        <span className="rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                            ✓ Google Books Verified
                                                        </span>
                                                    )}
                                                    {activeTab === "videos" && usedGemini && (
                                                        <span className="rounded-md bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                                            ✨ Gemini Verified YouTube
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs font-medium text-teal-200/70">{item.detail}</p>

                                                <div className="mt-2 rounded-xl bg-slate-950/60 border border-teal-500/10 p-3">
                                                    <p className="text-xs text-teal-100/90">
                                                        <span className="font-bold text-teal-400">Why It Matters: </span>
                                                        {item.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                                            <button
                                                onClick={() => toggleBookmark(`${activeTab}-${index}`)}
                                                className={`text-base p-1 transition-transform active:scale-125 ${isBookmarked ? "text-amber-400" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Bookmark Item"
                                            >
                                                ★
                                            </button>
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/10 border border-teal-500/25 px-3.5 py-1.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500 hover:text-slate-950"
                                                >
                                                    <span>Open Resource</span>
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-teal-500/15 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between text-xs text-teal-200/50">
                <span>
                    {activeTab === "professional_titles"
                        ? `${professional_titles.length} calibrated market compensation tiers`
                        : `${filteredContent.length} resources curated for ${region}`}
                </span>
                <span>Market Standard Currency: {metadata.currency_symbol}</span>
            </div>
        </div>
    );
}

