"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLocationFromDB, saveLocationToDB, LOCATION_TTL_MS } from "@/lib/db";
import type { GeoData } from "@/lib/validators";

export type LocationStatus = "idle" | "resolving" | "resolved" | "fallback" | "error";

interface LocationState {
  status: LocationStatus;
  data: GeoData | null;
  message: string;
}

const FALLBACK_GEO: GeoData = {
  city: "Global",
  region: "Worldwide",
  country: "Earth",
  countryCode: "000",
  lat: 0,
  lon: 0,
};

// In-memory cache to prevent concurrent duplicate requests
const locationCache = new Map<string, Promise<GeoData>>();

async function fetchFromAPI(lat?: number, lon?: number): Promise<GeoData> {
  const cacheKey = lat !== undefined && lon !== undefined ? `${lat},${lon}` : "ip";
  
  // Return cached promise if request is in flight
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }
  
  const params = new URLSearchParams();
  if (lat !== undefined) params.set("lat", String(lat));
  if (lon !== undefined) params.set("lon", String(lon));
  
  const promise = fetch(`/api/location?${params.toString()}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .finally(() => {
      // Remove from cache after request completes
      locationCache.delete(cacheKey);
    });
  
  locationCache.set(cacheKey, promise);
  return promise;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: "idle", data: null, message: "" });
  const mountedRef = useRef(true);

  const syncAndSet = useCallback(async (geo: GeoData, source: "gps" | "ip" | "manual") => {
    if (!mountedRef.current) return;
    await saveLocationToDB(geo);
    const status = source === "manual" || source === "ip" ? "fallback" : "resolved";
    setState({ status, data: geo, message: `Synced via ${source}` });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      // 1. Check DB Cache with TTL
      const cached = await getLocationFromDB();
      if (cached && Date.now() - cached.updatedAt < LOCATION_TTL_MS) {
        setState({ status: "resolved", data: cached, message: "Loaded from offline cache" });
        return;
      }

      // 2. Attempt Ambient GPS
      setState({ status: "resolving", data: null, message: "Detecting location..." });
      if (!navigator.geolocation) {
        await handleFallback();
        return;
      }

      const timeout = setTimeout(() => {
        if (mountedRef.current) handleFallback();
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          clearTimeout(timeout);
          try {
            const geo = await fetchFromAPI(pos.coords.latitude, pos.coords.longitude);
            if (mountedRef.current) await syncAndSet(geo, "gps");
          } catch {
            if (mountedRef.current) await handleFallback();
          }
        },
        () => handleFallback(),
        { enableHighAccuracy: false, timeout: 2500, maximumAge: 60000 }
      );
    };

    const handleFallback = async () => {
      const geo = await fetchFromAPI();
      if (mountedRef.current) await syncAndSet(geo, "ip");
    };

    init();

    return () => { mountedRef.current = false; };
  }, [syncAndSet]);

  const overrideLocation = useCallback(async (geo: GeoData) => {
    await syncAndSet(geo, "manual");
  }, [syncAndSet]);

  return { ...state, overrideLocation };
}
