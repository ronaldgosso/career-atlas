import { getDB, type RecommendationRecord } from "@/lib/db";

export async function getCachedRecommendations(): Promise<RecommendationRecord[]> {
  const db = await getDB();
  const records = await db.getAll("recommendations");
  // Deterministic sort ensures consistent UI order across renders
  return records.sort((a, b) => b.generatedAt - a.generatedAt);
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