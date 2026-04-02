import { GeoSchema } from "./validators";
import type { GeoData } from "./validators";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const IP_API_URL = "https://ipapi.co/json/";

async function fetchReverseGeo(lat: number, lon: number): Promise<Partial<GeoData>> {
  try {
    // Nominatim requires HTTPS and polite usage; we set Accept-Language to standardize English results
    const res = await fetch(`${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, {
      headers: { "Accept-Language": "en", "User-Agent": "career-atlas/1.0 (educational)" },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};
    return {
      city: addr.city || addr.town || addr.village || addr.hamlet || "Unknown Locality",
      region: addr.state || addr.province || "Unknown Region",
      country: addr.country || "Unknown Country",
      countryCode: addr.country_code?.toUpperCase() || "XX",
    };
  } catch {
    return {};
  }
}

async function fetchIPGeo(): Promise<Partial<GeoData>> {
  try {
    const res = await fetch(IP_API_URL);
    if (!res.ok) throw new Error(`IP API HTTP ${res.status}`);
    const data = await res.json();
    return {
      city: data.city || "Global",
      region: data.region || "Worldwide",
      country: data.country_name || "Earth",
      countryCode: data.country_code || "000",
      lat: data.latitude || 0,
      lon: data.longitude || 0,
    };
  } catch {
    return { city: "Global", region: "Worldwide", country: "Earth", countryCode: "000", lat: 0, lon: 0 };
  }
}

export async function resolveLocation(lat: number, lon: number): Promise<GeoData> {
  const reverse = await fetchReverseGeo(lat, lon);
  const fallback = await fetchIPGeo();
  const merged = {
    city: reverse.city || fallback.city,
    region: reverse.region || fallback.region,
    country: reverse.country || fallback.country,
    countryCode: reverse.countryCode || fallback.countryCode,
    lat: reverse.lat ?? lat,
    lon: reverse.lon ?? lon,
  };
  return GeoSchema.parse(merged);
}

export async function resolveIPFallback(): Promise<GeoData> {
  const fallback = await fetchIPGeo();
  return GeoSchema.parse({
    city: fallback.city,
    region: fallback.region,
    country: fallback.country,
    countryCode: fallback.countryCode,
    lat: fallback.lat || 0,
    lon: fallback.lon || 0,
  });
}