"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation } from "@/hooks/use-location";
import type { GeoData } from "@/lib/validators";
import { MapPin, ChevronDown, Check, Search, X, Globe } from "lucide-react";

const COMMON_LOCALES: GeoData[] = [
  { city: "New York", region: "NY", country: "United States", countryCode: "US", lat: 40.71, lon: -74.00 },
  { city: "San Francisco", region: "CA", country: "United States", countryCode: "US", lat: 37.77, lon: -122.42 },
  { city: "London", region: "England", country: "United Kingdom", countryCode: "GB", lat: 51.50, lon: -0.12 },
  { city: "Berlin", region: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lon: 13.40 },
  { city: "Paris", region: "Île-de-France", country: "France", countryCode: "FR", lat: 48.85, lon: 2.35 },
  { city: "Amsterdam", region: "North Holland", country: "Netherlands", countryCode: "NL", lat: 52.36, lon: 4.90 },
  { city: "Tokyo", region: "Kanto", country: "Japan", countryCode: "JP", lat: 35.67, lon: 139.65 },
  { city: "Singapore", region: "Central", country: "Singapore", countryCode: "SG", lat: 1.35, lon: 103.82 },
  { city: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", lat: 19.07, lon: 72.87 },
  { city: "Sydney", region: "NSW", country: "Australia", countryCode: "AU", lat: -33.86, lon: 151.20 },
  { city: "Toronto", region: "ON", country: "Canada", countryCode: "CA", lat: 43.65, lon: -79.38 },
  { city: "Dubai", region: "Dubai", country: "UAE", countryCode: "AE", lat: 25.20, lon: 55.27 },
  { city: "São Paulo", region: "SP", country: "Brazil", countryCode: "BR", lat: -23.55, lon: -46.63 },
  { city: "Nairobi", region: "Nairobi County", country: "Kenya", countryCode: "KE", lat: -1.29, lon: 36.82 },
  { city: "Lagos", region: "Lagos State", country: "Nigeria", countryCode: "NG", lat: 6.52, lon: 3.37 },
];

export function LocationSwitcher() {
  const { data, overrideLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLabel = data ? `${data.city}, ${data.countryCode}` : "Detecting...";
  const isReady = data !== null;

  // Handle outside click & touch
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleLocationSelect = (loc: GeoData) => {
    overrideLocation(loc);
    setIsOpen(false);
  };

  const filteredLocales = COMMON_LOCALES.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.city.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      loc.countryCode.toLowerCase().includes(q) ||
      loc.region.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${isOpen ? "z-50" : "z-20"}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer ${
          isOpen
            ? "border-teal-400/50 bg-teal-900/50 text-white shadow-teal-500/10"
            : "border-teal-500/30 bg-teal-950/50 text-teal-100 hover:border-teal-500/50 hover:bg-teal-900/40 hover:text-white"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current location: ${currentLabel}. Click to change region.`}
      >
        <span
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
            isReady ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400 animate-pulse"
          }`}
        />
        <MapPin className="h-3.5 w-3.5 text-teal-300/80 shrink-0" />
        <span className="max-w-[130px] truncate font-semibold">{currentLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-teal-300/60 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-teal-200" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select a region"
          className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/80 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="border-b border-teal-500/15 bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-teal-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-400" />
                <p className="text-xs font-bold text-white tracking-wide">Select Talent Market</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-teal-300/60 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-teal-200/60 mt-1">
              Calibrate salaries, tech stacks, & hiring benchmarks to region
            </p>

            {/* Quick Search */}
            <div className="relative mt-2.5">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-teal-400/50 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or country..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-teal-500/20 bg-slate-900/90 text-xs text-teal-100 placeholder-teal-300/40 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-xs text-teal-400/70 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Locales List */}
          <ul className="max-h-64 space-y-0.5 overflow-y-auto p-2 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-teal-700/50">
            {filteredLocales.length === 0 ? (
              <li className="py-6 text-center text-xs text-teal-200/50">
                No matching regions found
              </li>
            ) : (
              filteredLocales.map((loc) => {
                const isSelected =
                  data?.city?.toLowerCase() === loc.city.toLowerCase() &&
                  data?.countryCode?.toUpperCase() === loc.countryCode.toUpperCase();

                return (
                  <li key={`${loc.city}-${loc.countryCode}`} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleLocationSelect(loc)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all ${
                        isSelected
                          ? "bg-teal-500/20 text-white font-semibold border border-teal-500/30"
                          : "text-teal-100/80 hover:bg-teal-900/30 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-mono font-bold ${
                            isSelected
                              ? "bg-teal-400 text-slate-950"
                              : "bg-teal-950/80 border border-teal-500/20 text-teal-300"
                          }`}
                        >
                          {loc.countryCode}
                        </span>
                        <div className="truncate">
                          <span className="font-medium text-white">{loc.city}</span>
                          <span className="text-teal-200/50">, {loc.country}</span>
                        </div>
                      </div>

                      {isSelected && <Check className="h-3.5 w-3.5 text-teal-300 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-teal-500/10 bg-slate-900/60 px-3 py-2 flex items-center justify-between text-[11px] text-teal-300/50">
            <span>Press Esc to close</span>
            <span>{filteredLocales.length} regions</span>
          </div>
        </div>
      )}
    </div>
  );
}
