"use client";

import { useState } from "react";
import { useLocation } from "@/hooks/use-location";
import type { GeoData } from "@/lib/validators";

const COMMON_LOCALES: GeoData[] = [
  { city: "New York", region: "NY", country: "United States", countryCode: "US", lat: 40.71, lon: -74.00 },
  { city: "London", region: "England", country: "United Kingdom", countryCode: "GB", lat: 51.50, lon: -0.12 },
  { city: "Berlin", region: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lon: 13.40 },
  { city: "Tokyo", region: "Kanto", country: "Japan", countryCode: "JP", lat: 35.67, lon: 139.65 },
  { city: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", lat: 19.07, lon: 72.87 },
  { city: "Sydney", region: "NSW", country: "Australia", countryCode: "AU", lat: -33.86, lon: 151.20 },
  { city: "São Paulo", region: "SP", country: "Brazil", countryCode: "BR", lat: -23.55, lon: -46.63 },
  { city: "Nairobi", region: "Nairobi County", country: "Kenya", countryCode: "KE", lat: -1.29, lon: 36.82 },
  { city: "Lagos", region: "Lagos State", country: "Nigeria", countryCode: "NG", lat: 6.52, lon: 3.37 },
  { city: "Dubai", region: "Dubai", country: "UAE", countryCode: "AE", lat: 25.20, lon: 55.27 },
  { city: "Singapore", region: "Central", country: "Singapore", countryCode: "SG", lat: 1.35, lon: 103.82 },
  { city: "Toronto", region: "ON", country: "Canada", countryCode: "CA", lat: 43.65, lon: -79.38 },
];

export function LocationSwitcher() {
  const { data, overrideLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = data ? `${data.city}, ${data.countryCode}` : "Detecting...";
  const isReady = data !== null;

  const handleLocationSelect = (loc: GeoData) => {
    overrideLocation(loc);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-teal-950/30 px-4 py-2 text-xs font-medium transition-all hover:border-teal-500/30 hover:bg-teal-900/40 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={`inline-block h-2 w-2 rounded-full ${isReady ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
        <svg className="h-4 w-4 text-teal-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="max-w-[140px] truncate text-teal-100">{currentLabel}</span>
        <svg className={`h-3.5 w-3.5 text-teal-300/50 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 overflow-hidden rounded-xl border border-teal-500/20 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="border-b border-teal-500/10 bg-teal-950/40 px-4 py-3">
              <p className="text-xs font-semibold text-teal-100">Change Region</p>
              <p className="text-xs text-teal-200/50">Select a location for localized recommendations</p>
            </div>
            <ul className="max-h-80 space-y-0.5 overflow-y-auto p-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-teal-700">
              {COMMON_LOCALES.map((loc) => (
                <li key={`${loc.city}-${loc.countryCode}`}>
                  <button
                    onClick={() => handleLocationSelect(loc)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-teal-100/80 transition-all hover:bg-teal-900/30 hover:text-white"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-950/50 text-xs font-bold text-teal-300/70">
                      {loc.countryCode}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{loc.city}</span>
                      <span className="text-teal-200/50">, {loc.country}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-teal-500/10 bg-teal-950/40 px-4 py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg border border-teal-500/20 bg-teal-950/30 px-3 py-2 text-xs font-medium text-teal-200/60 transition-colors hover:border-teal-500/30 hover:text-teal-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
