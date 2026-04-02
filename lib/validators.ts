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

export const RecommendationItemSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(10), // Author, channel, or level
  url: z.string().url().nullable(),
  reason: z.string().min(20),
});

export const ProfessionalTitleSchema = z.object({
  title: z.string().min(1),
  level: z.enum(["Entry", "Mid-Level", "Senior", "Lead"]),
  salary_range: z.string().min(1),
  reason: z.string().min(20),
});

export const RecommendationSchema = z.object({
  books: z.array(RecommendationItemSchema).min(8).max(12),
  videos: z.array(RecommendationItemSchema).min(8).max(12),
  projects: z.array(RecommendationItemSchema).min(8).max(12),
  online_resources: z.array(RecommendationItemSchema).min(8).max(12),
  professional_titles: z.array(ProfessionalTitleSchema).min(5).max(12),
  metadata: z.object({
    region: z.string(),
    currency_symbol: z.string(),
    generated_at: z.string(),
  }),
});

export type RecommendationPayload = z.infer<typeof RecommendationSchema>;

export interface RecommendRequest {
  location: GeoData;
  field: string;
}