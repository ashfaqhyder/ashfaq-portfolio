import { NextRequest, NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";

import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

import { getApps } from "firebase-admin/app";

export const dynamic = "force-dynamic";

const adminApp = getApps()[0];

if (!adminApp) {
  throw new Error(
    "Firebase Admin SDK has not been initialized."
  );
}

const adminDb = getFirestore(adminApp);

const appearanceDocument =
  adminDb
    .collection("site")
    .doc("appearance");

function isValidHex(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(value)
  );
}

/* =========================================================
   GET — PUBLIC APPEARANCE SETTINGS
   ========================================================= */

export async function GET() {
  try {
    const snapshot =
      await appearanceDocument.get();

    if (!snapshot.exists) {
      return NextResponse.json({
        settings: {
          backgroundColor: "#050505",
          surfaceColor: "#111111",
          textColor: "#F5F5F5",
          mutedColor: "#8A8A8A",
          borderColor: "#252525",
          accentColor: "#B6FF3B",
          animationsEnabled: true,
          smoothScrollEnabled: true,
          ditherBackgroundEnabled: true,
        },
      });
    }

    const data = snapshot.data();

    return NextResponse.json({
      settings: {
        backgroundColor:
          data?.backgroundColor || "#050505",

        surfaceColor:
          data?.surfaceColor || "#111111",

        textColor:
          data?.textColor || "#F5F5F5",

        mutedColor:
          data?.mutedColor || "#8A8A8A",

        borderColor:
          data?.borderColor || "#252525",

        accentColor:
          data?.accentColor || "#B6FF3B",

        animationsEnabled:
          typeof data?.animationsEnabled ===
          "boolean"
            ? data.animationsEnabled
            : true,

        smoothScrollEnabled:
          typeof data?.smoothScrollEnabled ===
          "boolean"
            ? data.smoothScrollEnabled
            : true,

        ditherBackgroundEnabled:
          typeof data?.ditherBackgroundEnabled ===
          "boolean"
            ? data.ditherBackgroundEnabled
            : true,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load Appearance settings:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load Appearance settings.",
      },
      {
        status: 500,
      }
    );
  }
}


/* =========================================================
   POST — ADMIN SAVE
   ========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization.slice(7);

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    if (
      decodedToken.admin !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const {
      backgroundColor,
      surfaceColor,
      textColor,
      mutedColor,
      borderColor,
      accentColor,
      animationsEnabled,
      smoothScrollEnabled,
      ditherBackgroundEnabled,
    } = body;

    if (
      !isValidHex(backgroundColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Background color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidHex(surfaceColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Surface color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidHex(textColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Text color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidHex(mutedColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Muted color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidHex(borderColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Border color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidHex(accentColor)
    ) {
      return NextResponse.json(
        {
          error:
            "Accent color must be a valid HEX color.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof animationsEnabled !==
        "boolean" ||
      typeof smoothScrollEnabled !==
        "boolean" ||
      typeof ditherBackgroundEnabled !==
        "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Animation settings must be boolean values.",
        },
        {
          status: 400,
        }
      );
    }

    await appearanceDocument.set(
      {
        backgroundColor,
        surfaceColor,
        textColor,
        mutedColor,
        borderColor,
        accentColor,
        animationsEnabled,
        smoothScrollEnabled,
        ditherBackgroundEnabled,
        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Appearance settings saved successfully.",
    });
  } catch (error: unknown) {
    console.error(
      "Appearance API error:",
      error
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error
    ) {
      const firebaseError =
        error as {
          code?: string;
        };

      if (
        firebaseError.code ===
        "auth/id-token-expired"
      ) {
        return NextResponse.json(
          {
            error:
              "Your session has expired. Please sign in again.",
          },
          {
            status: 401,
          }
        );
      }

      if (
        firebaseError.code ===
        "auth/invalid-id-token"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid authentication token. Please sign in again.",
          },
          {
            status: 401,
          }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save Appearance settings.",
      },
      {
        status: 500,
      }
    );
  }
}