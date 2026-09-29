import { auth } from "@/lib/firebase/auth";

export interface SeoSettings {
  siteName: string;
  title: string;
  description: string;
  author: string;
  keywords: string[];
  siteUrl: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  updatedAt?: unknown;
}

export const defaultSeoSettings: SeoSettings = {
  siteName: "Ashfaq Hyder",
  title: "Ashfaq Hyder — Creative Developer",
  description:
    "Portfolio of Ashfaq Hyder — Creative Developer, AI/ML Enthusiast and Multimedia Creator.",
  author: "Ashfaq Hyder",
  keywords: [
    "Ashfaq Hyder",
    "Creative Developer",
    "AI",
    "ML",
    "Web Development",
    "Portfolio",
  ],
  siteUrl: "",
  canonicalUrl: "",
  ogTitle: "Ashfaq Hyder — Creative Developer",
  ogDescription:
    "Creative Developer, AI/ML Enthusiast and Multimedia Creator.",
  ogImage: "",
  twitterCard: "summary_large_image",
  robotsIndex: true,
  robotsFollow: true,
  updatedAt: undefined,
};

/**
 * Client-side loader.
 *
 * Used by /admin/seo.
 * This intentionally uses the API instead of Firebase Admin.
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const response = await fetch("/api/admin/seo", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load SEO settings.");
    }

    const data = await response.json();

    return {
      ...defaultSeoSettings,
      ...data.settings,
      keywords: Array.isArray(data.settings?.keywords)
        ? data.settings.keywords
        : defaultSeoSettings.keywords,
    } as SeoSettings;
  } catch (error) {
    console.error(
      "Failed to load SEO settings:",
      error
    );

    return defaultSeoSettings;
  }
}

/**
 * Client-side save.
 *
 * The Firebase ID token is sent to the protected
 * Next.js API route.
 */
export async function saveSeoSettings(
  settings: Omit<SeoSettings, "updatedAt">
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to save SEO settings."
    );
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch("/api/admin/seo", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(settings),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Failed to save SEO settings."
    );
  }

  return data;
}