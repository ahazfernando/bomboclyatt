import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bomboclyatt.com";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/giveaways`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
