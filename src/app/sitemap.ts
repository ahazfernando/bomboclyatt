import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bomboclyatt.com";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];
}
