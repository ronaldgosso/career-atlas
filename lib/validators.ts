import { z } from "zod";

export const GeoSchema = z.object({
  city: z.string().min(1, "City is required"),
  region: z.string(),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().length(2, "ISO-3166-1 alpha-2 required"),
  lat: z.number(),
  lon: z.number(),
});

export type GeoData = z.infer<typeof GeoSchema>;