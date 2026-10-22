import type { MetadataRoute } from "next";
import { products, farmers } from "@/lib/data";
import { siteUrl } from "@/lib/qr";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/shop`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/our-story`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/farmers`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/trace`, priority: 0.5, changeFrequency: "monthly" },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    priority: 0.85,
    changeFrequency: "weekly" as const,
  }));

  const farmerPages: MetadataRoute.Sitemap = farmers.map((f) => ({
    url: `${base}/farmers/${f.id}`,
    priority: 0.5,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...productPages, ...farmerPages];
}
