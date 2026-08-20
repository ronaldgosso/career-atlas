"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "@/hooks/use-location";
import type { GeoData } from "@/lib/validators";
import { MapPin, ChevronDown, Check, Search, X, Globe } from "lucide-react";

export interface LocaleEntry extends GeoData {
  continent: "North America" | "Europe" | "Asia Pacific" | "Middle East" | "Latin America" | "Africa";
}

const CONTINENTS = [
  "All",
  "North America",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Latin America",
  "Africa",
] as const;

const GLOBAL_LOCALES: LocaleEntry[] = [
  // North America
  { city: "San Francisco", region: "CA", country: "United States", countryCode: "US", lat: 37.77, lon: -122.42, continent: "North America" },
  { city: "New York", region: "NY", country: "United States", countryCode: "US", lat: 40.71, lon: -74.00, continent: "North America" },
  { city: "Seattle", region: "WA", country: "United States", countryCode: "US", lat: 47.60, lon: -122.33, continent: "North America" },
  { city: "Austin", region: "TX", country: "United States", countryCode: "US", lat: 30.26, lon: -97.74, continent: "North America" },
  { city: "Boston", region: "MA", country: "United States", countryCode: "US", lat: 42.36, lon: -71.05, continent: "North America" },
  { city: "Chicago", region: "IL", country: "United States", countryCode: "US", lat: 41.87, lon: -87.62, continent: "North America" },
  { city: "Toronto", region: "ON", country: "Canada", countryCode: "CA", lat: 43.65, lon: -79.38, continent: "North America" },
  { city: "Vancouver", region: "BC", country: "Canada", countryCode: "CA", lat: 49.28, lon: -123.12, continent: "North America" },
  { city: "Montreal", region: "QC", country: "Canada", countryCode: "CA", lat: 45.50, lon: -73.56, continent: "North America" },
  { city: "Mexico City", region: "CDMX", country: "Mexico", countryCode: "MX", lat: 19.43, lon: -99.13, continent: "North America" },

  // Europe
  { city: "London", region: "England", country: "United Kingdom", countryCode: "GB", lat: 51.50, lon: -0.12, continent: "Europe" },
  { city: "Berlin", region: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lon: 13.40, continent: "Europe" },
  { city: "Munich", region: "Bavaria", country: "Germany", countryCode: "DE", lat: 48.13, lon: 11.58, continent: "Europe" },
  { city: "Paris", region: "Île-de-France", country: "France", countryCode: "FR", lat: 48.85, lon: 2.35, continent: "Europe" },
  { city: "Amsterdam", region: "North Holland", country: "Netherlands", countryCode: "NL", lat: 52.36, lon: 4.90, continent: "Europe" },
  { city: "Dublin", region: "Leinster", country: "Ireland", countryCode: "IE", lat: 53.34, lon: -6.26, continent: "Europe" },
  { city: "Stockholm", region: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.32, lon: 18.06, continent: "Europe" },
  { city: "Zurich", region: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.37, lon: 8.54, continent: "Europe" },
  { city: "Warsaw", region: "Mazovia", country: "Poland", countryCode: "PL", lat: 52.22, lon: 21.01, continent: "Europe" },
  { city: "Madrid", region: "Madrid", country: "Spain", countryCode: "ES", lat: 40.41, lon: -3.70, continent: "Europe" },
  { city: "Barcelona", region: "Catalonia", country: "Spain", countryCode: "ES", lat: 41.38, lon: 2.17, continent: "Europe" },
  { city: "Tallinn", region: "Harju", country: "Estonia", countryCode: "EE", lat: 59.43, lon: 24.75, continent: "Europe" },

  // Asia Pacific
  { city: "Tokyo", region: "Kanto", country: "Japan", countryCode: "JP", lat: 35.67, lon: 139.65, continent: "Asia Pacific" },
  { city: "Singapore", region: "Central", country: "Singapore", countryCode: "SG", lat: 1.35, lon: 103.82, continent: "Asia Pacific" },
  { city: "Bengaluru", region: "Karnataka", country: "India", countryCode: "IN", lat: 12.97, lon: 77.59, continent: "Asia Pacific" },
  { city: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", lat: 19.07, lon: 72.87, continent: "Asia Pacific" },
  { city: "Hyderabad", region: "Telangana", country: "India", countryCode: "IN", lat: 17.38, lon: 78.48, continent: "Asia Pacific" },
  { city: "Seoul", region: "Capital Area", country: "South Korea", countryCode: "KR", lat: 37.56, lon: 126.97, continent: "Asia Pacific" },
  { city: "Sydney", region: "NSW", country: "Australia", countryCode: "AU", lat: -33.86, lon: 151.20, continent: "Asia Pacific" },
  { city: "Melbourne", region: "VIC", country: "Australia", countryCode: "AU", lat: -37.81, lon: 144.96, continent: "Asia Pacific" },
  { city: "Hong Kong", region: "SAR", country: "Hong Kong", countryCode: "HK", lat: 22.31, lon: 114.16, continent: "Asia Pacific" },
  { city: "Taipei", region: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.03, lon: 121.56, continent: "Asia Pacific" },
  { city: "Auckland", region: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -36.84, lon: 174.76, continent: "Asia Pacific" },
  { city: "Jakarta", region: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.20, lon: 106.84, continent: "Asia Pacific" },
  { city: "Manila", region: "Metro Manila", country: "Philippines", countryCode: "PH", lat: 14.59, lon: 120.98, continent: "Asia Pacific" },
  { city: "Bangkok", region: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.75, lon: 100.50, continent: "Asia Pacific" },
  { city: "Kuala Lumpur", region: "Federal Territory", country: "Malaysia", countryCode: "MY", lat: 3.13, lon: 101.68, continent: "Asia Pacific" },

  // Middle East
  { city: "Dubai", region: "Dubai", country: "UAE", countryCode: "AE", lat: 25.20, lon: 55.27, continent: "Middle East" },
  { city: "Abu Dhabi", region: "Abu Dhabi", country: "UAE", countryCode: "AE", lat: 24.45, lon: 54.37, continent: "Middle East" },
  { city: "Riyadh", region: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.71, lon: 46.67, continent: "Middle East" },
  { city: "Tel Aviv", region: "Tel Aviv", country: "Israel", countryCode: "IL", lat: 32.08, lon: 34.78, continent: "Middle East" },
  { city: "Doha", region: "Doha", country: "Qatar", countryCode: "QA", lat: 25.28, lon: 51.53, continent: "Middle East" },
  { city: "Istanbul", region: "Marmara", country: "Turkey", countryCode: "TR", lat: 41.00, lon: 28.97, continent: "Middle East" },

  // Latin America
  { city: "São Paulo", region: "SP", country: "Brazil", countryCode: "BR", lat: -23.55, lon: -46.63, continent: "Latin America" },
  { city: "Rio de Janeiro", region: "RJ", country: "Brazil", countryCode: "BR", lat: -22.90, lon: -43.17, continent: "Latin America" },
  { city: "Buenos Aires", region: "Capital Federal", country: "Argentina", countryCode: "AR", lat: -34.60, lon: -58.38, continent: "Latin America" },
  { city: "Bogotá", region: "Cundinamarca", country: "Colombia", countryCode: "CO", lat: 4.71, lon: -74.07, continent: "Latin America" },
  { city: "Santiago", region: "Santiago Metro", country: "Chile", countryCode: "CL", lat: -33.44, lon: -70.66, continent: "Latin America" },
  { city: "Lima", region: "Lima", country: "Peru", countryCode: "PE", lat: -12.04, lon: -77.04, continent: "Latin America" },

  // Africa
  { city: "Dar es Salaam", region: "Dar es Salaam", country: "Tanzania", countryCode: "TZ", lat: -6.79, lon: 39.21, continent: "Africa" },
  { city: "Zanzibar", region: "Urban West", country: "Tanzania", countryCode: "TZ", lat: -6.16, lon: 39.20, continent: "Africa" },
  { city: "Arusha", region: "Arusha Region", country: "Tanzania", countryCode: "TZ", lat: -3.37, lon: 36.68, continent: "Africa" },
  { city: "Nairobi", region: "Nairobi County", country: "Kenya", countryCode: "KE", lat: -1.29, lon: 36.82, continent: "Africa" },
  { city: "Kampala", region: "Central Region", country: "Uganda", countryCode: "UG", lat: 0.35, lon: 32.58, continent: "Africa" },
  { city: "Kigali", region: "Kigali", country: "Rwanda", countryCode: "RW", lat: -1.94, lon: 30.06, continent: "Africa" },
  { city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", countryCode: "ET", lat: 9.03, lon: 38.74, continent: "Africa" },
  { city: "Lagos", region: "Lagos State", country: "Nigeria", countryCode: "NG", lat: 6.52, lon: 3.37, continent: "Africa" },
  { city: "Cape Town", region: "Western Cape", country: "South Africa", countryCode: "ZA", lat: -33.92, lon: 18.42, continent: "Africa" },
  { city: "Johannesburg", region: "Gauteng", country: "South Africa", countryCode: "ZA", lat: -26.20, lon: 28.04, continent: "Africa" },
  { city: "Cairo", region: "Cairo Governorate", country: "Egypt", countryCode: "EG", lat: 30.04, lon: 31.23, continent: "Africa" },
  { city: "Casablanca", region: "Casablanca-Settat", country: "Morocco", countryCode: "MA", lat: 33.57, lon: -7.58, continent: "Africa" },
  { city: "Accra", region: "Greater Accra", country: "Ghana", countryCode: "GH", lat: 5.60, lon: -0.18, continent: "Africa" },
];

export function LocationSwitcher() {
  const { data, overrideLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<typeof CONTINENTS[number]>("All");
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
      setSelectedContinent("All");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleLocationSelect = (loc: GeoData) => {
    overrideLocation(loc);
    setIsOpen(false);
  };

  const filteredLocales = useMemo(() => {
    return GLOBAL_LOCALES.filter((loc) => {
      // Continent filter
      if (selectedContinent !== "All" && loc.continent !== selectedContinent) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const qNormalized = q.replace(/[\s\-_]/g, "");
      
      const cityNorm = loc.city.toLowerCase().replace(/[\s\-_]/g, "");
      const countryNorm = loc.country.toLowerCase().replace(/[\s\-_]/g, "");
      const regionNorm = loc.region.toLowerCase().replace(/[\s\-_]/g, "");

      return (
        loc.city.toLowerCase().includes(q) ||
        cityNorm.includes(qNormalized) ||
        loc.country.toLowerCase().includes(q) ||
        countryNorm.includes(qNormalized) ||
        loc.countryCode.toLowerCase() === q ||
        loc.region.toLowerCase().includes(q) ||
        regionNorm.includes(qNormalized) ||
        loc.continent.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedContinent]);

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
          className="absolute right-0 top-full mt-2 z-50 w-84 sm:w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/90 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="border-b border-teal-500/15 bg-gradient-to-r from-teal-950/70 via-slate-900/90 to-teal-950/50 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-400" />
                <p className="text-xs font-bold text-white tracking-wide">Select Talent Market</p>
                <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.2 text-[10px] font-mono text-teal-300">
                  {GLOBAL_LOCALES.length} Hubs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-teal-300/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-teal-200/60 mt-1">
              Calibrate compensation, tech stacks, & hiring benchmarks
            </p>

            {/* Quick Search */}
            <div className="relative mt-2.5">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-teal-400/50 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, country, or code (e.g., Tokyo, London, SG)..."
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

            {/* Continental Filter Chips */}
            <div className="flex gap-1 overflow-x-auto pt-2.5 no-scrollbar scrollbar-none pb-0.5">
              {CONTINENTS.map((continent) => (
                <button
                  key={continent}
                  type="button"
                  onClick={() => setSelectedContinent(continent)}
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                    selectedContinent === continent
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                      : "bg-teal-950/50 text-teal-300/70 hover:bg-teal-900/50 hover:text-teal-200 border border-teal-500/15"
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>

          {/* Locales List */}
          <ul className="max-h-72 space-y-0.5 overflow-y-auto p-2 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-teal-700/50">
            {filteredLocales.length === 0 ? (
              <li className="py-8 text-center text-xs text-teal-200/50">
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
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-500/20 text-white font-semibold border border-teal-500/30 shadow-sm shadow-teal-500/5"
                          : "text-teal-100/80 hover:bg-teal-900/35 hover:text-white"
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
                          <span className="text-[10px] text-teal-300/40 ml-1.5 font-mono">({loc.region})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-teal-300/40 hidden sm:inline">
                          {loc.continent}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-teal-300 shrink-0" />}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-teal-500/10 bg-slate-900/60 px-3 py-2 flex items-center justify-between text-[11px] text-teal-300/50">
            <span>Press Esc to close</span>
            <span>{filteredLocales.length} of {GLOBAL_LOCALES.length} hubs</span>
          </div>
        </div>
      )}
    </div>
  );
}

