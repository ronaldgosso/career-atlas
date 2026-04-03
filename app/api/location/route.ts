import { NextRequest, NextResponse } from "next/server";
import { GeoSchema } from "@/lib/validators";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const IP_API_URL = "https://ipapi.co/json/";

async function fetchIPGeo(): Promise<Record<string, unknown>> {
  const res = await fetch(IP_API_URL, {
    headers: { "Accept-Language": "en" },
    next: { revalidate: 86400 },
  });
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
}

async function fetchReverseGeo(lat: number, lon: number): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    {
      headers: { "Accept-Language": "en", "User-Agent": "career-atlas/1.0 (educational)" },
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();
  const addr = data.address || {};
  return {
    city: addr.city || addr.town || addr.village || addr.hamlet || "Unknown Locality",
    region: addr.state || addr.province || "Unknown Region",
    country: addr.country || "Unknown Country",
    countryCode: addr.country_code?.toUpperCase() || "XX",
    lat,
    lon,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    let geo: Record<string, unknown>;

    if (lat && lon) {
      // Reverse geocode from GPS coordinates
      const reverse = await fetchReverseGeo(parseFloat(lat), parseFloat(lon));
      try {
        const ipData = await fetchIPGeo();
        geo = {
          city: reverse.city || ipData.city,
          region: reverse.region || ipData.region,
          country: reverse.country || ipData.country,
          countryCode: reverse.countryCode || ipData.countryCode,
          lat: reverse.lat,
          lon: reverse.lon,
        };
      } catch {
        geo = reverse;
      }
    } else {
      // IP-based fallback
      geo = await fetchIPGeo();
    }

    const validated = GeoSchema.safeParse(geo);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid geolocation data" }, { status: 500 });
    }

    return NextResponse.json(validated.data);
  } catch {
    // Hardcoded global fallback
    return NextResponse.json({
      city: "Global",
      region: "Worldwide",
      country: "Earth",
      countryCode: "000",
      lat: 0,
      lon: 0,
    });
  }
}
