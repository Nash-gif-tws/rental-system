import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rental-system-production.up.railway.app"
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ]
}
