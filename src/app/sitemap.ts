import type { MetadataRoute } from "next";
import { CREATORS } from "@/lib/data/creators";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/discover", "/briefs", "/briefs/new", "/engagements", "/trust", "/model", "/deck", "/onboarding/identity"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...CREATORS.map((c) => ({
      url: `${BASE}/creators/${c.handle}`,
      lastModified: new Date(c.verifiedAt ?? "2026-01-01"),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}