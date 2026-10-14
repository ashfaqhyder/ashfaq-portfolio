import { auth } from "@/lib/firebase/auth";

export interface AppearanceSettings {
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  accentColor: string;
  animationsEnabled: boolean;
  smoothScrollEnabled: boolean;
  ditherBackgroundEnabled: boolean;
  updatedAt?: unknown;
}

export const defaultAppearanceSettings: AppearanceSettings = {
  backgroundColor: "#050505",
  surfaceColor: "#111111",
  textColor: "#F5F5F5",
  mutedColor: "#8A8A8A",
  borderColor: "#252525",
  accentColor: "#B6FF3B",
  animationsEnabled: true,
  smoothScrollEnabled: true,
  ditherBackgroundEnabled: true,
  updatedAt: undefined,
};

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
  try {
    const response = await fetch(
      "/api/admin/appearance",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load Appearance settings."
      );
    }

    const data = await response.json();

    return {
      ...defaultAppearanceSettings,
      ...data.settings,
    } as AppearanceSettings;
  } catch (error) {
    console.error(
      "Failed to load Appearance settings:",
      error
    );

    return defaultAppearanceSettings;
  }
}

export async function saveAppearanceSettings(
  settings: Omit<AppearanceSettings, "updatedAt">
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to save Appearance settings."
    );
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "/api/admin/appearance",
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
        "Failed to save Appearance settings."
    );
  }

  return data;
}