"use client";

import { useState, useMemo, useEffect } from "react";
import { type RecommendationPayload } from "@/lib/validators";
import { exportRecommendationToPDF } from "@/lib/pdf-export";
import {
    Briefcase,
    Code2,
    BookOpen,
    Video,
    GraduationCap,
    Zap,
    Star,
    Bookmark,
    CheckCircle2,
    Rocket,
    ClipboardList,
    ExternalLink,
} from "lucide-react";

type Tab = "professional_titles" | "projects" | "roadmap" | "books" | "videos" | "online_resources";

const TABS: { key: Tab; label: string; Icon: React.ElementType; subtitle: string }[] = [
    { key: "professional_titles", label: "Market Compensation & Roles", Icon: Briefcase, subtitle: "Salary benchmarks & job levels" },
    { key: "projects", label: "Capstone Projects", Icon: Code2, subtitle: "Recruiter-grade portfolio pieces" },
    { key: "roadmap", label: "Skill Roadmap & Milestones", Icon: CheckCircle2, subtitle: "Self-assessment & tracker" },
    { key: "books", label: "Curated Literature", Icon: BookOpen, subtitle: "Verified books & deep-dive reading" },
    { key: "videos", label: "Masterclasses & Videos", Icon: Video, subtitle: "Video tutorials & tech series" },
    { key: "online_resources", label: "Courses & Certifications", Icon: GraduationCap, subtitle: "Specialized learning paths" },
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
    isFromCache?: boolean;
}

export function RecommendationsDashboard({
    payload,
    onReset,
    region,
    field,
    generatedAt,
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

    // Competency statuses state with localStorage persistence
    const [competencyStatuses, setCompetencyStatuses] = useState<Record<string, "todo" | "in_progress" | "mastered">>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(`career_atlas_competency_${effectiveField}`);
                if (saved) {
                    setCompetencyStatuses(JSON.parse(saved));
                }
            } catch {
                // Ignore storage errors
            }
        }
    }, [effectiveField]);

    const handleToggleCompetency = (id: string) => {
        setCompetencyStatuses((prev) => {
            const current = prev[id] || "todo";
            const nextStatus: "todo" | "in_progress" | "mastered" =
                current === "todo" ? "in_progress" : current === "in_progress" ? "mastered" : "todo";
            const updated = { ...prev, [id]: nextStatus };
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(`career_atlas_competency_${effectiveField}`, JSON.stringify(updated));
                } catch {
                    // Ignore
                }
            }
            return updated;
        });
    };

    // Synthesize structured milestones from data
    const roadmapMilestones = useMemo(() => {
        const milestones = [
            ...professional_titles.map((title, idx) => ({
                id: `role-req-${idx}`,
                category: "Target Role Readiness",
                title: `${title.title} Core Competencies`,
                description: title.reason,
                badge: `${title.level} Tier`,
                level: title.level,
            })),
            ...projects.map((proj, idx) => ({
                id: `capstone-req-${idx}`,
                category: "Practical Portfolio Execution",
                title: `Deliver ${proj.title}`,
                description: `${proj.detail} — Validates: ${proj.reason}`,
                badge: `Capstone #${idx + 1}`,
                level: "Mid-Level",
            })),
            ...books.slice(0, 3).map((book, idx) => ({
                id: `book-req-${idx}`,
                category: "Domain Theory & Fundamentals",
                title: `Master ${book.title}`,
                description: `${book.detail} — Key focus: ${book.reason}`,
                badge: "Literature",
                level: "Entry",
            })),
        ];
        return milestones;
    }, [professional_titles, projects, books]);

    const roadmapStats = useMemo(() => {
        const total = roadmapMilestones.length;
        if (total === 0) return { mastered: 0, inProgress: 0, total: 0, percent: 0 };
        const mastered = roadmapMilestones.filter((m) => competencyStatuses[m.id] === "mastered").length;
        const inProgress = roadmapMilestones.filter((m) => competencyStatuses[m.id] === "in_progress").length;
        const percent = Math.round(((mastered + inProgress * 0.5) / total) * 100);
        return { mastered, inProgress, total, percent };
    }, [roadmapMilestones, competencyStatuses]);

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
            `# CAREER ATLAS EXECUTIVE DOSSIER`,
            `**Discipline:** ${effectiveField}`,
            `**Target Market:** ${region}`,
            `**Generated:** ${new Date(metadata.generated_at).toLocaleDateString()}`,
            `\n## Market Compensation & Target Roles:`,
            ...professional_titles.map((p) => `- **${p.title}** (${p.level}): ${p.salary_range} — ${p.reason}`),
            `\n## Recommended Capstone Projects:`,
            ...projects.map((p) => `- **${p.title}**: ${p.detail} (Why: ${p.reason})`),
            `\n## Curated Literature:`,
            ...books.map((b) => `- **${b.title}** by ${b.detail} (${b.url})`),
            `\n## Courses & Certifications:`,
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

    // Export PDF
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

        if (activeTab === "roadmap") {
            return roadmapMilestones.filter((m) => {
                if (!q) return true;
                return (
                    m.title.toLowerCase().includes(q) ||
                    m.description.toLowerCase().includes(q) ||
                    m.category.toLowerCase().includes(q)
                );
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
    }, [activeTab, tabFilterQuery, selectedLevel, professional_titles, projects, books, videos, online_resources, roadmapMilestones]);

    return (
        <div className="overflow-hidden rounded-3xl border border-teal-500/20 bg-slate-950/80 shadow-2xl backdrop-blur-xl transition-all">
            {/* ── Top Executive Briefing Header ── */}
            <div className="border-b border-teal-500/15 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 px-4 py-5 sm:px-6 lg:px-8 sm:py-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Title & Metadata */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verified Career Advisory
                            </span>
                            {isFromCache && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-cyan-300">
                                    <Zap className="h-3 w-3" /> 1h Cached
                                </span>
                            )}
                            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-[11px] sm:text-xs text-teal-300 font-mono">
                                {region}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white text-gradient">
                            {effectiveField}
                        </h2>
                        <p className="text-xs text-teal-200/60 max-w-2xl">
                            Calibrated hiring standards, compensation benchmarks, and competency curriculum customized for the {region} market.
                        </p>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={handleCopyDossier}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/50 px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-teal-200 transition-all hover:bg-teal-900/60 hover:text-white hover:border-teal-400 active:scale-95 shadow-sm cursor-pointer"
                        >
                            {copiedDossier ? (
                                <>
                                    <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Copied Brief!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    <span>Copy Brief</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:brightness-110 active:scale-95 shadow-md shadow-teal-500/20 cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Export PDF</span>
                        </button>

                        {onReset && (
                            <button
                                onClick={onReset}
                                className="rounded-xl border border-neutral-700/60 bg-slate-900/50 p-2.5 text-xs text-neutral-400 transition-colors hover:text-white hover:bg-slate-800 cursor-pointer"
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
                <div className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3 sm:p-3.5 backdrop-blur-sm">
                        <p className="text-[10px] sm:text-[11px] font-medium text-teal-300/70">Top Market Compensation</p>
                        <p className="mt-1 text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                            {salarySummary?.topRange || "Competitive"}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3 sm:p-3.5 backdrop-blur-sm">
                        <p className="text-[10px] sm:text-[11px] font-medium text-teal-300/70">Hiring Standard Roles</p>
                        <p className="mt-1 text-base sm:text-lg font-bold text-white">
                            {professional_titles.length} Standardized Tiers
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3 sm:p-3.5 backdrop-blur-sm">
                        <p className="text-[10px] sm:text-[11px] font-medium text-teal-300/70">Curated Portfolio Assets</p>
                        <p className="mt-1 text-base sm:text-lg font-bold text-white">
                            {projects.length} Capstone Ideas
                        </p>
                    </div>
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/60 p-3 sm:p-3.5 backdrop-blur-sm">
                        <p className="text-[10px] sm:text-[11px] font-medium text-teal-300/70">Shortlisted / Bookmarked</p>
                        <p className="mt-1 text-base sm:text-lg font-bold text-amber-300">
                            {bookmarkedIds.size} Saved
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Executive Tab Navigation Bar ── */}
            <div className="border-b border-teal-500/10 bg-slate-950/90 px-4 py-3 sm:px-6">
                <div className="flex gap-2 overflow-x-auto horizontal-scroll no-scrollbar py-1 cursor-grab active:cursor-grabbing">
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
                                className={`group relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-all duration-200 whitespace-nowrap focus:outline-none shrink-0 ${
                                    isActive
                                        ? "bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-transparent border border-teal-400/40 text-white shadow-lg shadow-teal-500/10"
                                        : "border border-transparent text-teal-200/60 hover:text-white hover:bg-slate-900/60"
                                }`}
                            >
                                <tab.Icon className={`h-4 w-4 ${isActive ? "text-teal-300" : "text-teal-400/60"}`} />
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
                    <div className="flex items-center gap-1.5 overflow-x-auto horizontal-scroll no-scrollbar py-0.5">
                        <span className="text-[11px] text-teal-300/60 font-medium mr-1 shrink-0">Seniority:</span>
                        {["All", "Entry", "Mid-Level", "Senior", "Lead"].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setSelectedLevel(lvl)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
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
            <div className="p-4 sm:p-6 lg:p-8">
                {filteredContent.length === 0 ? (
                    <div className="rounded-2xl border border-teal-500/10 bg-slate-900/30 p-6 sm:p-8 text-center">
                        <p className="text-sm font-medium text-teal-200">No matching items for &ldquo;{tabFilterQuery}&rdquo;</p>
                        <button onClick={() => setTabFilterQuery("")} className="mt-2 text-xs text-teal-400 hover:underline cursor-pointer">
                            Clear filter
                        </button>
                    </div>
                ) : activeTab === "professional_titles" ? (
                    /* ── SALARIES & ROLES VIEW ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {(filteredContent as typeof professional_titles).map((item, index) => {
                            const lvlCfg = LEVEL_CONFIG[item.level] || LEVEL_CONFIG.Entry;
                            const isBookmarked = bookmarkedIds.has(`title-${index}`);

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-gradient-to-br from-slate-900/80 to-teal-950/30 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative space-y-3.5 sm:space-y-4">
                                        {/* Header & Bookmark */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${lvlCfg.bg} ${lvlCfg.text} ${lvlCfg.border}`}>
                                                    {item.level} Level
                                                </span>
                                                <h4 className="mt-2 text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmark(`title-${index}`)}
                                                className={`transition-transform active:scale-125 cursor-pointer ${isBookmarked ? "text-amber-400 scale-110" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Save to Shortlist"
                                            >
                                                <Star className={`h-5 w-5 ${isBookmarked ? "fill-amber-400" : ""}`} />
                                            </button>
                                        </div>

                                        {/* Compensation Callout & Progress */}
                                        <div className="rounded-xl border border-teal-500/15 bg-slate-950/60 p-3.5 sm:p-4 space-y-2">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <span className="text-[10px] sm:text-[11px] uppercase font-mono text-teal-300/60">Estimated Benchmark</span>
                                                <span className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-300">
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
                                            <p className="font-semibold text-teal-300 text-[10px] sm:text-[11px] uppercase tracking-wider">Market Expectations:</p>
                                            <p>{item.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : activeTab === "projects" ? (
                    /* ── CAPSTONE & PORTFOLIO PROJECTS VIEW ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {(filteredContent as typeof projects).map((item, index) => {
                            const isBookmarked = bookmarkedIds.has(`proj-${index}`);
                            const isCopied = copiedBulletIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-slate-900/70 p-4 sm:p-6 transition-all duration-300 hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between"
                                >
                                    <div className="relative space-y-3.5 sm:space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                                                <Rocket className="h-3 w-3" />
                                                <span>Capstone #{index + 1}</span>
                                            </span>
                                            <button
                                                onClick={() => toggleBookmark(`proj-${index}`)}
                                                className={`transition-transform active:scale-125 cursor-pointer ${isBookmarked ? "text-amber-400 scale-110" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Save to Shortlist"
                                            >
                                                <Star className={`h-5 w-5 ${isBookmarked ? "fill-amber-400" : ""}`} />
                                            </button>
                                        </div>

                                        <div>
                                            <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="mt-1 text-xs text-teal-200/70">{item.detail}</p>
                                        </div>

                                        <div className="rounded-xl border border-teal-500/15 bg-slate-950/60 p-3 sm:p-3.5 space-y-1.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Recruiter Competency Validation:</p>
                                            <p className="text-xs text-teal-100/80 leading-relaxed italic">&ldquo;{item.reason}&rdquo;</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-3 border-t border-teal-500/10 flex flex-wrap items-center justify-between gap-2">
                                        <button
                                            onClick={() => handleCopyResumeBullet(item, index)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-950/40 px-3 py-1.5 text-[11px] font-semibold text-teal-300 transition-all hover:bg-teal-900/50 hover:text-white cursor-pointer"
                                        >
                                            {isCopied ? (
                                                <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Bullet Copied!</>
                                            ) : (
                                                <><ClipboardList className="h-3.5 w-3.5" /> Copy Resume Impact</>
                                            )}
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
                ) : activeTab === "roadmap" ? (
                    /* ── INTERACTIVE COMPETENCY & MILESTONE ROADMAP ── */
                    <div className="space-y-6">
                        {/* Overall Progress Card */}
                        <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-slate-950/90 p-4 sm:p-6 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <h4 className="text-sm sm:text-base font-bold text-white">
                                            {effectiveField} Competency Mastery
                                        </h4>
                                    </div>
                                    <p className="text-xs text-teal-200/60">
                                        Track target milestones derived from market expectations & recruiter validations.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <span className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300">
                                            {roadmapStats.percent}%
                                        </span>
                                        <p className="text-[10px] uppercase font-mono text-teal-300/60">Proficiency Score</p>
                                    </div>
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-teal-500/30 flex items-center justify-center bg-slate-950 font-bold text-xs text-teal-300">
                                        {roadmapStats.mastered}/{roadmapStats.total}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-teal-500/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 transition-all duration-500"
                                    style={{ width: `${Math.max(5, roadmapStats.percent)}%` }}
                                />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-teal-200/60">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    {roadmapStats.mastered} Mastered
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                                    {roadmapStats.inProgress} In Progress
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-slate-600" />
                                    {roadmapStats.total - roadmapStats.mastered - roadmapStats.inProgress} Pending
                                </span>
                            </div>
                        </div>

                        {/* Milestones List */}
                        <div className="space-y-3">
                            {filteredContent.map((itemAny) => {
                                const item = itemAny as {
                                    id: string;
                                    category: string;
                                    title: string;
                                    description: string;
                                    badge: string;
                                    level: string;
                                };
                                const status = competencyStatuses[item.id] || "todo";

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleToggleCompetency(item.id)}
                                        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                                            status === "mastered"
                                                ? "border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-500/5"
                                                : status === "in_progress"
                                                ? "border-cyan-500/35 bg-cyan-950/20 shadow-md shadow-cyan-500/5"
                                                : "border-teal-500/15 bg-slate-900/60 hover:border-teal-400/30 hover:bg-slate-900/90"
                                        }`}
                                    >
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400/80 font-bold">
                                                    {item.category}
                                                </span>
                                                <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <h4
                                                className={`text-sm sm:text-base font-bold transition-colors ${
                                                    status === "mastered"
                                                        ? "text-emerald-300 line-through decoration-emerald-500/60"
                                                        : "text-white group-hover:text-cyan-300"
                                                }`}
                                            >
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-teal-200/70">{item.description}</p>
                                        </div>

                                        {/* Status Pill Button */}
                                        <div className="shrink-0 flex items-center justify-start sm:justify-end">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                                                    status === "mastered"
                                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                        : status === "in_progress"
                                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                                        : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
                                                }`}
                                            >
                                                {status === "mastered" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                                                {status === "in_progress" && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
                                                {status === "todo" && <span className="h-2 w-2 rounded-full bg-slate-500" />}
                                                <span>
                                                    {status === "mastered"
                                                        ? "Mastered"
                                                        : status === "in_progress"
                                                        ? "In Progress"
                                                        : "To Learn"}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* ── BOOKS / VIDEOS / COURSES VIEW ── */
                    <div className="space-y-3 sm:space-y-3.5">
                        {(filteredContent as typeof books).map((item, index) => {
                            const isBookmarked = bookmarkedIds.has(`${activeTab}-${index}`);

                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-teal-500/15 bg-slate-900/60 p-4 sm:p-5 transition-all duration-300 hover:border-teal-400/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-teal-500/10"
                                >
                                    <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        {/* Content */}
                                        <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0">
                                            <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-xs sm:text-sm font-bold text-teal-300 border border-teal-500/30">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    {activeTab === "books" && (
                                                        <span className="rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Verified Publication
                                                        </span>
                                                    )}
                                                    {activeTab === "videos" && (
                                                        <span className="rounded-md bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] font-semibold text-blue-300 inline-flex items-center gap-1">
                                                            <Video className="h-3 w-3" /> Verified Masterclass
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs font-medium text-teal-200/70">{item.detail}</p>

                                                <div className="mt-2 rounded-xl bg-slate-950/60 border border-teal-500/10 p-3">
                                                    <p className="text-xs text-teal-100/90 leading-relaxed">
                                                        <span className="font-bold text-teal-400">Why It Matters: </span>
                                                        {item.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-teal-500/10">
                                            <button
                                                onClick={() => toggleBookmark(`${activeTab}-${index}`)}
                                                className={`p-1.5 transition-transform active:scale-125 cursor-pointer ${isBookmarked ? "text-amber-400" : "text-neutral-600 hover:text-amber-300"}`}
                                                title="Bookmark Item"
                                            >
                                                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
                                            </button>
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/10 border border-teal-500/25 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500 hover:text-slate-950"
                                                >
                                                    <span>Open</span>
                                                    <ExternalLink className="h-3.5 w-3.5" />
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
            <div className="border-t border-teal-500/15 bg-slate-900/60 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-teal-200/50">
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

