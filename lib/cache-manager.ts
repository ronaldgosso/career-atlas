import { getDB, type RecommendationRecord, RECOMMENDATION_TTL_MS } from "@/lib/db";
import type { GeoData, RecommendationPayload } from "@/lib/validators";

export async function getCachedRecommendations(): Promise<RecommendationRecord[]> {
  const db = await getDB();
  const records = await db.getAll("recommendations");
  // Deterministic sort ensures consistent UI order across renders
  return records.sort((a, b) => b.generatedAt - a.generatedAt);
}

/**
 * Checks if a valid cached recommendation exists for the given location & field within TTL (default 1 hour).
 */
export async function getValidCachedRecommendation(
  location: GeoData,
  field: string,
  ttlMs = RECOMMENDATION_TTL_MS
): Promise<RecommendationRecord | null> {
  const records = await getCachedRecommendations();
  const now = Date.now();

  const targetCity = (location?.city || "").trim().toLowerCase();
  const targetCountry = (location?.country || "").trim().toLowerCase();
  const targetField = (field || "").trim().toLowerCase();

  const match = records.find((rec) => {
    const recCity = (rec.location?.city || "").trim().toLowerCase();
    const recCountry = (rec.location?.country || "").trim().toLowerCase();
    const recField = (rec.field || "").trim().toLowerCase();

    const locationMatches =
      recCity === targetCity && (!targetCountry || !recCountry || recCountry === targetCountry);
    const fieldMatches = recField === targetField;
    const isFresh = now - rec.generatedAt < ttlMs;

    return locationMatches && fieldMatches && isFresh;
  });

  return match || null;
}

export async function saveRecommendationToDB(
  location: GeoData,
  field: string,
  data: RecommendationPayload
): Promise<void> {
  const db = await getDB();
  const id = `${location.city.toLowerCase()}-${field.toLowerCase()}-${Date.now()}`;
  await db.put("recommendations", {
    id,
    location,
    field,
    data,
    generatedAt: Date.now(),
  });
}

export async function deleteRecommendation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("recommendations", id);
}

export async function clearAllRecommendations(): Promise<void> {
  const db = await getDB();
  await db.clear("recommendations");
}

export function exportToJSON(records: RecommendationRecord[]): string {
  return JSON.stringify(records, null, 2);
}