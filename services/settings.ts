import { auth } from "@/lib/firebase/auth";

export interface SiteSettings {
  siteEnabled: boolean;
  maintenanceMode: boolean;

  contactEmail: string;

  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  xUrl: string;

  defaultLanguage: string;
  timezone: string;

  newProjectsPublishedByDefault: boolean;
  newAchievementsPublishedByDefault: boolean;
  newExperiencePublishedByDefault: boolean;

  confirmBeforeDelete: boolean;
  autoSaveEnabled: boolean;

  updatedAt?: unknown;
}

export const defaultSiteSettings: SiteSettings = {
  siteEnabled: true,
  maintenanceMode: false,

  contactEmail: "",

  githubUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  xUrl: "",

  defaultLanguage: "en",
  timezone: "Asia/Kolkata",

  newProjectsPublishedByDefault: false,
  newAchievementsPublishedByDefault: false,
  newExperiencePublishedByDefault: false,

  confirmBeforeDelete: true,
  autoSaveEnabled: false,

  updatedAt: undefined,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch(
      "/api/admin/settings",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load site settings."
      );
    }

    const data = await response.json();

    return {
      ...defaultSiteSettings,
      ...data.settings,
    } as SiteSettings;
  } catch (error) {
    console.error(
      "Failed to load site settings:",
      error
    );

    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(
  settings: Omit<SiteSettings, "updatedAt">
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to save Settings."
    );
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "/api/admin/settings",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(settings),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Failed to save site settings."
    );
  }

  return data;
}

export async function resetSiteSettings() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to reset Settings."
    );
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "/api/admin/settings",
    {
      method: "DELETE",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Failed to reset site settings."
    );
  }

  return data;
}