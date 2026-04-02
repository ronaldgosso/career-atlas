"use client";

import { useState } from "react";
import { useLocation } from "@/hooks/use-location";
import type { GeoData } from "@/lib/validators";

// Curated representative locales for rapid testing and manual selection
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
];

export function LocationSwitcher() {
  const { data, overrideLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = data ? `${data.city}, ${data.countryCode}` : "Detecting...";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={`inline-block h-2 w-2 rounded-full ${isOpen ? "bg-yellow-500" : "bg-emerald-500"} animate-pulse`} />
        {currentLabel}
      </button>

      {isOpen && (
        <>
          {/* Backdrop closes popover on outside click */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-neutral-800 bg-[var(--bg-surface)] p-2 shadow-xl">
            <p className="px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">Select Region</p>
            <ul className="mt-1 max-h-64 space-y-1 overflow-y-auto no-scrollbar">
              {COMMON_LOCALES.map((loc) => (
                <li key={loc.countryCode}>
                  <button
                    onClick={() => { overrideLocation(loc); setIsOpen(false); }}
                    className="w-full rounded px-2 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-neutral-800 transition-colors"
                  >
                    {loc.city}, {loc.country}
                  </button>
                </li>
              ))}
              <li className="mt-2 border-t border-neutral-800 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded px-2 py-2 text-left text-xs text-[var(--text-muted)] hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}