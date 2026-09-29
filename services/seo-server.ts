import "server-only";

import { adminDb } from "@/lib/firebase/admin";

import {
  defaultSeoSettings,
  type SeoSettings,
} from "./seo";

export async function getServerSeoSettings(): Promise<SeoSettings> {
  try {
    const snapshot = await adminDb
      .collection("site")
      .doc("seo")
      .get();

    if (!snapshot.exists) {
      return defaultSeoSettings;
    }

    const data = snapshot.data() ?? {};

    return {
      ...defaultSeoSettings,
      ...data,
      keywords: Array.isArray(data.keywords)
        ? data.keywords.filter(
            (keyword): keyword is string =>
              typeof keyword === "string"
          )
        : defaultSeoSettings.keywords,
    } as SeoSettings;
  } catch (error) {
    console.error(
      "Failed to load server SEO settings:",
      error
    );

    return defaultSeoSettings;
  }
}