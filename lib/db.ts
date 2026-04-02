import { openDB, type IDBPDatabase } from "idb";

export interface LocationRecord {
  id: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
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
        // Prevents duplicate writes on location refresh
        db.createObjectStore("preferences", { keyPath: "id" });
        // Allows cache invalidation by timestamp
        db.createObjectStore("recommendations", { keyPath: "id" });
        // Stores raw geo data with expiry checks
        db.createObjectStore("locationCache", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}