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

export function FieldSelector({
    onFieldSelect,
    disabled
}: {
    onFieldSelect: (field: string) => void;
    disabled?: boolean;
}) {
    const [hoveredField, setHoveredField] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-teal-100 uppercase tracking-wider">Select Your Field</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FIELDS.map((field, index) => {
                    const isSelected = hoveredField === field;
                    return (
                        <button
                            key={field}
                            disabled={disabled}
                            onClick={() => onFieldSelect(field)}
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
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 ${isSelected ? "opacity-100" : ""}`} />

                            {/* Icon */}
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
    );
}
