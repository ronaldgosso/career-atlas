"use client";

import { useState, useMemo } from "react";
import { Monitor, Building2, HeartPulse, Wrench, HardHat } from "lucide-react";

interface FieldMetadata {
    name: string;
    tag?: string;
    demand?: "High" | "Surging" | "Top Compensation" | "Core";
    salaryPreview?: string;
}

const CATEGORIES: { label: string; Icon: React.ElementType; fields: FieldMetadata[] }[] = [
    {
        label: "Technology & Software Systems",
        Icon: Monitor,
        fields: [
            { name: "Software Engineering", tag: "Core Engineering", demand: "High" },
            { name: "Cloud & DevOps", tag: "Infrastructure", demand: "Surging" },
            { name: "Machine Learning Engineering", tag: "Data & Systems", demand: "Top Compensation" },
            { name: "Data Science & Analytics", tag: "Analytics", demand: "High" },
            { name: "Cybersecurity", tag: "SecOps", demand: "Surging" },
            { name: "UI/UX Design", tag: "Product Design", demand: "High" },
            { name: "Product Management", tag: "Leadership", demand: "Top Compensation" },
            { name: "Information Technology (IT)", tag: "Systems", demand: "Core" },
            { name: "Network Administration", tag: "Networks", demand: "Core" },
            { name: "Digital Marketing Tech", tag: "Growth", demand: "High" },
        ],
    },
    {
        label: "Executive & Professional Services",
        Icon: Building2,
        fields: [
            { name: "Finance & Accounting", tag: "Fintech & Audit", demand: "Top Compensation" },
            { name: "Law & Legal Tech", tag: "Compliance & Tech", demand: "High" },
        ],
    },
    {
        label: "Healthcare & Life Sciences",
        Icon: HeartPulse,
        fields: [
            { name: "Healthcare & MedTech", tag: "Clinical & Digital", demand: "Surging" },
            { name: "Education & EdTech", tag: "Learning Systems", demand: "Core" },
        ],
    },
    {
        label: "Engineering & Advanced Systems",
        Icon: Wrench,
        fields: [
            { name: "Engineering & Manufacturing", tag: "Robotics & Hardware", demand: "High" },
        ],
    },
    {
        label: "Infrastructure & Built Environment",
        Icon: HardHat,
        fields: [
            { name: "Construction & Real Estate", tag: "PropTech & Projects", demand: "Core" },
        ],
    },
];

const DEMAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Surging: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    "Top Compensation": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20" },
    High: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    Core: { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-500/20" },
};

export function FieldSelector({
    onFieldSelect,
    useGemini,
    onGeminiToggle,
    disabled,
}: {
    onFieldSelect: (field: string, useGemini: boolean) => void;
    useGemini: boolean;
    onGeminiToggle: () => void;
    disabled?: boolean;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredField, setHoveredField] = useState<string | null>(null);

    // Filter fields based on search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return CATEGORIES;
        const q = searchQuery.toLowerCase();
        return CATEGORIES.map((cat) => ({
            ...cat,
            fields: cat.fields.filter(
                (f) =>
                    f.name.toLowerCase().includes(q) ||
                    (f.tag && f.tag.toLowerCase().includes(q)) ||
                    cat.label.toLowerCase().includes(q)
            ),
        })).filter((cat) => cat.fields.length > 0);
    }, [searchQuery]);

    const totalMatchingFields = useMemo(() => {
        return filteredCategories.reduce((acc, cat) => acc + cat.fields.length, 0);
    }, [filteredCategories]);

    return (
        <div className="space-y-6">
            {/* Top Toolbar: Search & Live Video Grounding */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Instant Search Bar */}
                <div className="md:col-span-7 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-teal-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search career fields, tech, roles (e.g., DevOps, Cloud, Product)..."
                        disabled={disabled}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-teal-500/20 bg-slate-900/60 text-sm text-teal-100 placeholder-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 backdrop-blur-md transition-all shadow-inner"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-teal-400/60 hover:text-teal-200"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Live Video Search Sync Toggle */}
                <div className="md:col-span-5 rounded-xl border border-teal-500/20 bg-slate-900/60 p-3 backdrop-blur-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-teal-100 truncate">Live YouTube Masterclasses</p>
                            <p className="text-[10px] text-teal-200/50 truncate">Verified channels & video series</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onGeminiToggle}
                        disabled={disabled}
                        className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                            useGemini ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-neutral-800"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                useGemini ? "translate-x-5" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Quick Market Intelligence Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-teal-200/60 px-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-medium text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Verified Market Intelligence
                    </span>
                    <span>•</span>
                    <span>18 Standardized Global Career Disciplines</span>
                </div>
                {searchQuery && (
                    <span className="text-teal-300 font-medium">
                        Showing {totalMatchingFields} matching disciplines
                    </span>
                )}
            </div>

            {/* Category Sections */}
            {filteredCategories.length === 0 ? (
                <div className="rounded-2xl border border-teal-500/10 bg-slate-900/40 p-8 text-center backdrop-blur-md">
                    <p className="text-base font-medium text-teal-100">No career fields match &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-xs text-teal-200/50 mt-1">Try searching for Software, Cloud, Finance, Data, or Design</p>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-xs text-teal-300 hover:text-teal-100 underline underline-offset-4"
                    >
                        Clear search filter
                    </button>
                </div>
            ) : (
                filteredCategories.map((category) => (
                    <div key={category.label} className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <category.Icon className="h-4 w-4 text-teal-300/70" />
                            <h2 className="text-xs font-bold text-teal-200/80 uppercase tracking-widest">
                                {category.label}
                            </h2>
                            <span className="text-[11px] text-teal-300/40 font-mono">({category.fields.length})</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-teal-500/30 to-transparent" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {category.fields.map((field) => {
                                const isSelected = hoveredField === field.name;
                                const demandStyle = field.demand ? DEMAND_COLORS[field.demand] : DEMAND_COLORS.Core;

                                return (
                                    <button
                                        key={field.name}
                                        disabled={disabled}
                                        onClick={() => onFieldSelect(field.name, useGemini)}
                                        onMouseEnter={() => setHoveredField(field.name)}
                                        onMouseLeave={() => setHoveredField(null)}
                                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 ${
                                            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                        } ${
                                            isSelected
                                                ? "border-teal-400 bg-gradient-to-br from-slate-900/90 via-teal-950/40 to-slate-900/90 text-white shadow-xl shadow-teal-500/10 scale-[1.02]"
                                                : "border-teal-500/15 bg-slate-900/50 text-teal-100/80 hover:border-teal-400/40 hover:bg-slate-900/80 hover:text-white hover:scale-[1.015]"
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        <div className="relative space-y-3">
                                            {/* Top badges */}
                                            <div className="flex items-center justify-between gap-2">
                                                {field.tag && (
                                                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-teal-300/80 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/20">
                                                        {field.tag}
                                                    </span>
                                                )}
                                                {field.demand && (
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${demandStyle.bg} ${demandStyle.text} ${demandStyle.border}`}>
                                                        {field.demand}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Field Name & Action Arrow */}
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-semibold text-sm leading-snug group-hover:text-cyan-300 transition-colors">
                                                    {field.name}
                                                </span>
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-950/60 border border-teal-500/20 text-teal-300 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-cyan-500 group-hover:text-slate-950 transition-all">
                                                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}


