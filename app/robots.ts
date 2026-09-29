import type { MetadataRoute } from "next";

import { getServerSeoSettings } from "@/services/seo-server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getServerSeoSettings();

  const baseUrl = (
    seo.siteUrl ||
    seo.canonicalUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: seo.robotsIndex ? "/" : undefined,
      disallow: seo.robotsIndex ? undefined : "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}