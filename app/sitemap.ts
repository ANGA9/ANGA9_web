import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://anga9.com",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://seller.anga9.com/sell-on-anga9",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://seller.anga9.com/how-to-sell",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://seller.anga9.com/shipping",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://seller.anga9.com/grow-business",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
