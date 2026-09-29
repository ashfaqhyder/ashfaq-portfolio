import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "@/lib/firebase/auth";

export interface PreviewData {
  homepage: Record<string, unknown> | null;
  about: Record<string, unknown> | null;

  projects: Record<string, unknown>[];
  experience: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  photography: Record<string, unknown>[];
  creativeLab: Record<string, unknown>[];
  digitalLab: Record<string, unknown>[];
}

function waitForAuthUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();

        if (!user) {
          reject(
            new Error(
              "You must be signed in to preview the portfolio."
            )
          );

          return;
        }

        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export async function getPreviewData(): Promise<PreviewData> {
  const user = await waitForAuthUser();

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "/api/admin/preview",
    {
      method: "GET",
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
        "Failed to load preview."
    );
  }

  return data.preview as PreviewData;
}