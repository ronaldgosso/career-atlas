"use client";

import { useState } from "react";

const CATEGORIES: { label: string; emoji: string; fields: string[] }[] = [
    {
        label: "Technology",
        emoji: "💻",
        fields: [
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
        ],
    },
    {
        label: "Professional Services",
        emoji: "🏛️",
        fields: [
            "Finance & Accounting",
            "Law & Legal Tech",
        ],
    },
    {
        label: "Health & Education",
        emoji: "🩺",
        fields: [
            "Healthcare & MedTech",
            "Education & EdTech",
        ],
    },
];

export function FieldSelector({
    onFieldSelect,
    useGemini,
    onGeminiToggle,
    disabled
}: {
    onFieldSelect: (field: string, useGemini: boolean) => void;
    useGemini: boolean;
    onGeminiToggle: () => void;
    disabled?: boolean;
}) {
    const [hoveredField, setHoveredField] = useState<string | null>(null);

    let globalIndex = 0;

    return (
        <div className="space-y-6">
            {/* Gemini Toggle */}
            <div className="rounded-xl border border-teal-500/10 bg-teal-950/20 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                            <svg className="h-4 w-4 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-teal-100">Enable Gemini for real YouTube videos</p>
                            <p className="text-xs text-teal-200/50">Searches YouTube for currently available videos instead of AI-generated suggestions</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onGeminiToggle}
                        disabled={disabled}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${useGemini ? "bg-blue-500" : "bg-neutral-700"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${useGemini ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                </div>
            </div>

            {/* Category Sections */}
            {CATEGORIES.map((category) => (
                <div key={category.label} className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base">{category.emoji}</span>
                        <h2 className="text-sm font-semibold text-teal-100 uppercase tracking-wider">
                            {category.label}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {category.fields.map((field) => {
                            const index = globalIndex++;
                            const isSelected = hoveredField === field;
                            return (
                                <button
                                    key={field}
                                    disabled={disabled}
                                    onClick={() => onFieldSelect(field, useGemini)}
                                    onMouseEnter={() => setHoveredField(field)}
                                    onMouseLeave={() => setHoveredField(null)}
                                    className={`group relative overflow-hidden rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/40
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${isSelected
                                            ? "border-teal-500 bg-teal-500/10 text-teal-300 shadow-lg shadow-teal-500/10 scale-[1.02]"
                                            : "border-teal-500/10 bg-teal-950/20 text-teal-100/70 hover:border-teal-500/30 hover:bg-teal-900/30 hover:text-white hover:scale-[1.02]"
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 ${isSelected ? "opacity-100" : ""}`} />
                                    <div className="relative flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isSelected ? "bg-teal-500/20" : "bg-teal-950/50 group-hover:bg-teal-900/50"
                                            }`}>
                                            <svg className={`h-4 w-4 transition-colors ${isSelected ? "text-teal-300" : "text-teal-200/50 group-hover:text-teal-200/80"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <span className="line-clamp-2">{field}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
