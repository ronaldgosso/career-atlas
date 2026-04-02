"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLocationFromDB, saveLocationToDB, LOCATION_TTL_MS } from "@/lib/db";
import { resolveLocation, resolveIPFallback } from "@/lib/location";
import type { GeoData } from "@/lib/validators";

export type LocationStatus = "idle" | "resolving" | "resolved" | "fallback" | "error";

interface LocationState {
  status: LocationStatus;
  data: GeoData | null;
  message: string;
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
            const geo = await resolveLocation(pos.coords.latitude, pos.coords.longitude);
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
      try {
        const geo = await resolveIPFallback();
        if (mountedRef.current) await syncAndSet(geo, "ip");
      } catch {
        setState({ status: "error", data: null, message: "Location resolution failed" });
      }
    };

    init();

    return () => { mountedRef.current = false; };
  }, [syncAndSet]);

  const overrideLocation = useCallback(async (geo: GeoData) => {
    await syncAndSet(geo, "manual");
  }, [syncAndSet]);

  return { ...state, overrideLocation };
}