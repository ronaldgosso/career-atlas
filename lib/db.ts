import { openDB, type IDBPDatabase } from "idb";
import type { GeoData, RecommendationPayload } from "@/lib/validators";

export interface LocationRecord extends GeoData {
  id: string;
  updatedAt: number;
}

export interface PreferenceRecord {
  id: string;
  locationId: string;
  field: string;
  updatedAt: number;
}

// Matches the exact structure written in Phase 3 hooks/use-recommendations.ts
export interface RecommendationRecord {
  id: string;
  location: GeoData;
  field: string;
  data: RecommendationPayload;
  generatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("career-atlas-db", 1, {
      upgrade(db) {
        db.createObjectStore("locationCache", { keyPath: "id" });
        db.createObjectStore("preferences", { keyPath: "id" });
        db.createObjectStore("recommendations", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function getLocationFromDB(): Promise<LocationRecord | null> {
  const db = await getDB();
  return db.get("locationCache", "primary") || null;
}

export async function saveLocationToDB(data: Omit<LocationRecord, "id" | "updatedAt">): Promise<void> {
  const db = await getDB();
  await db.put("locationCache", { ...data, id: "primary", updatedAt: Date.now() });
}

export const LOCATION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
export const RECOMMENDATION_TTL_MS = 1000 * 60 * 60; // 1 hour