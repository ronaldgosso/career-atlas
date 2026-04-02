"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getDB } from "@/lib/db";

export type LocationStatus = "idle" | "resolving" | "resolved" | "fallback" | "error";

export interface GeoData {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

interface LocationState {
  status: LocationStatus;
  data: GeoData | null;
  message: string;
}

// Hardcoded fallback coordinates for zero-network scenarios
const FALLBACK_DATA: GeoData = {
  city: "Global",
  region: "Worldwide",
  country: "Earth",
  countryCode: "000",
  lat: 0,
  lon: 0,
};

export function useAmbientLocation() {
  const [state, setState] = useState<LocationState>({ status: "idle", data: null, message: "" });
  const resolvedRef = useRef(false);

  const persistToCache = useCallback(async (data: GeoData) => {
    const db = await getDB();
    await db.put("locationCache", {
      id: "primary",
      ...data,
      updatedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (resolvedRef.current || typeof navigator === "undefined") return;
    
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      // Geolocation stalled; trigger silent IP fallback path (Phase 2 implementation)
      setState(prev => ({ ...prev, status: "fallback", message: "GPS timeout; using network fallback" }));
    }, 3000);

    const success = async (pos: GeolocationPosition) => {
      if (cancelled) return;
      clearTimeout(timeout);
      // Reverse geocoding deferred to Phase 2 to keep Phase 1 lean
      // Storing raw coordinates for now
      const geo: GeoData = {
        city: "Detecting...",
        region: "Detecting...",
        country: "Detecting...",
        countryCode: "XX",
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      };
      await persistToCache(geo);
      if (!cancelled) setState({ status: "resolved", data: geo, message: "" });
      resolvedRef.current = true;
    };

    const error = () => {
      if (cancelled) return;
      clearTimeout(timeout);
      setState({ status: "fallback", data: FALLBACK_DATA, message: "Location restricted; defaulting to network" });
      resolvedRef.current = true;
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: false,
        timeout: 2500,
        maximumAge: 3600000, // Allow cached position to prevent repeated prompts
      });
    } else {
      error();
    }

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [persistToCache]);

  const overrideLocation = useCallback(async (data: GeoData) => {
    await persistToCache(data);
    setState({ status: "resolved", data, message: "" });
    resolvedRef.current = true;
  }, [persistToCache]);

  return { ...state, overrideLocation };
}