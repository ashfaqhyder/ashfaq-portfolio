import {
  NextRequest,
  NextResponse,
} from "next/server";

import { FieldValue } from "firebase-admin/firestore";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const settingsRef = adminDb
  .collection("site")
  .doc("settings");

const defaultSettings = {
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
};

function getBearerToken(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.substring(7).trim();
}

function isValidEmail(value: string) {
  if (!value) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function isAllowedLanguage(value: string) {
  return ["en", "en-IN"].includes(value);
}

function isAllowedTimezone(value: string) {
  return [
    "Asia/Kolkata",
    "UTC",
    "America/New_York",
    "Europe/London",
  ].includes(value);
}

async function verifyAdmin(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  try {
    const decodedToken =
      await adminAuth.verifyIdToken(token);

    if (decodedToken.admin !== true) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            error: "Admin access required.",
          },
          {
            status: 403,
          }
        ),
      };
    }

    return {
      ok: true as const,
      decodedToken,
    };
  } catch (error) {
    console.error(
      "Failed to verify admin token:",
      error
    );

    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Invalid authentication token.",
        },
        {
          status: 401,
        }
      ),
    };
  }
}

export async function GET() {
  try {
    const snapshot = await settingsRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({
        settings: defaultSettings,
      });
    }

    return NextResponse.json({
      settings: {
        ...defaultSettings,
        ...snapshot.data(),
      },
    });
  } catch (error) {
    console.error(
      "Failed to load site settings:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load site settings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const authResult =
      await verifyAdmin(request);

    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();

    const contactEmail =
      typeof body.contactEmail === "string"
        ? body.contactEmail.trim()
        : "";

    const githubUrl =
      typeof body.githubUrl === "string"
        ? body.githubUrl.trim()
        : "";

    const linkedinUrl =
      typeof body.linkedinUrl === "string"
        ? body.linkedinUrl.trim()
        : "";

    const instagramUrl =
      typeof body.instagramUrl === "string"
        ? body.instagramUrl.trim()
        : "";

    const xUrl =
      typeof body.xUrl === "string"
        ? body.xUrl.trim()
        : "";

    const defaultLanguage =
      typeof body.defaultLanguage === "string"
        ? body.defaultLanguage.trim()
        : defaultSettings.defaultLanguage;

    const timezone =
      typeof body.timezone === "string"
        ? body.timezone.trim()
        : defaultSettings.timezone;

    if (!isValidEmail(contactEmail)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid contact email.",
        },
        {
          status: 400,
        }
      );
    }

    const socialUrls = [
      {
        name: "GitHub",
        value: githubUrl,
      },
      {
        name: "LinkedIn",
        value: linkedinUrl,
      },
      {
        name: "Instagram",
        value: instagramUrl,
      },
      {
        name: "X",
        value: xUrl,
      },
    ];

    for (const social of socialUrls) {
      if (!isValidUrl(social.value)) {
        return NextResponse.json(
          {
            error: `${social.name} must be a valid HTTP or HTTPS URL.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    if (!isAllowedLanguage(defaultLanguage)) {
      return NextResponse.json(
        {
          error: "Unsupported default language.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isAllowedTimezone(timezone)) {
      return NextResponse.json(
        {
          error: "Unsupported timezone.",
        },
        {
          status: 400,
        }
      );
    }

    const settings = {
      siteEnabled:
        typeof body.siteEnabled === "boolean"
          ? body.siteEnabled
          : defaultSettings.siteEnabled,

      maintenanceMode:
        typeof body.maintenanceMode === "boolean"
          ? body.maintenanceMode
          : defaultSettings.maintenanceMode,

      contactEmail,

      githubUrl,
      linkedinUrl,
      instagramUrl,
      xUrl,

      defaultLanguage,
      timezone,

      newProjectsPublishedByDefault:
        typeof body.newProjectsPublishedByDefault ===
        "boolean"
          ? body.newProjectsPublishedByDefault
          : defaultSettings.newProjectsPublishedByDefault,

      newAchievementsPublishedByDefault:
        typeof body.newAchievementsPublishedByDefault ===
        "boolean"
          ? body.newAchievementsPublishedByDefault
          : defaultSettings.newAchievementsPublishedByDefault,

      newExperiencePublishedByDefault:
        typeof body.newExperiencePublishedByDefault ===
        "boolean"
          ? body.newExperiencePublishedByDefault
          : defaultSettings.newExperiencePublishedByDefault,

      confirmBeforeDelete:
        typeof body.confirmBeforeDelete === "boolean"
          ? body.confirmBeforeDelete
          : defaultSettings.confirmBeforeDelete,

      autoSaveEnabled:
        typeof body.autoSaveEnabled === "boolean"
          ? body.autoSaveEnabled
          : defaultSettings.autoSaveEnabled,
    };

    await settingsRef.set(
      {
        ...settings,
        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Failed to save site settings:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to save site settings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const authResult =
      await verifyAdmin(request);

    if (!authResult.ok) {
      return authResult.response;
    }

    await settingsRef.set(
      {
        ...defaultSettings,
        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error(
      "Failed to reset site settings:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to reset site settings.",
      },
      {
        status: 500,
      }
    );
  }
}