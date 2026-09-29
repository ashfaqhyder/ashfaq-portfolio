import type { MetadataRoute } from "next";

import { getServerSeoSettings } from "@/services/seo-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getServerSeoSettings();

  const baseUrl = (
    seo.siteUrl ||
    seo.canonicalUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}