import { openDB, type IDBPDatabase } from "idb";
import type { GeoData } from "@/lib/validators";

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

export interface RecommendationRecord {
  id: string;
  preferenceId: string;
  data: Record<string, unknown>;
  generatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("career-atlas-db", 1, {
      upgrade(db) {
        // Primary key 'primary' ensures single active location record
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
  await db.put("locationCache", {
    ...data,
    id: "primary",
    updatedAt: Date.now(),
  });
}

// 7-day cache window balances accuracy with rate-limit respect and offline reliability
export const LOCATION_TTL_MS = 1000 * 60 * 60 * 24 * 7;