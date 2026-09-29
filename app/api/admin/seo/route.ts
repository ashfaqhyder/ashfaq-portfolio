import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const defaultSeoSettings = {
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
};

async function verifyAdmin(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error(
      "Missing authentication token."
    );
  }

  const idToken = authorization
    .replace("Bearer ", "")
    .trim();

  if (!idToken) {
    throw new Error(
      "Missing authentication token."
    );
  }

  const decodedToken =
    await adminAuth.verifyIdToken(idToken);

  if (decodedToken.admin !== true) {
    throw new Error(
      "Administrator access required."
    );
  }

  return decodedToken;
}

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("site")
      .doc("seo")
      .get();

    if (!snapshot.exists) {
      return NextResponse.json({
        settings: defaultSeoSettings,
      });
    }

    const data = snapshot.data() ?? {};

    return NextResponse.json({
      settings: {
        ...defaultSeoSettings,
        ...data,
        keywords: Array.isArray(data.keywords)
          ? data.keywords
          : defaultSeoSettings.keywords,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load SEO settings:",
      error
    );

    return NextResponse.json({
      settings: defaultSeoSettings,
    });
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    const body = await request.json();

    const keywords = Array.isArray(body.keywords)
      ? body.keywords
          .filter(
            (keyword: unknown): keyword is string =>
              typeof keyword === "string"
          )
          .map((keyword: string) =>
            keyword.trim()
          )
          .filter(Boolean)
      : defaultSeoSettings.keywords;

    const settings = {
      siteName:
        typeof body.siteName === "string"
          ? body.siteName.trim()
          : defaultSeoSettings.siteName,

      title:
        typeof body.title === "string"
          ? body.title.trim()
          : defaultSeoSettings.title,

      description:
        typeof body.description === "string"
          ? body.description.trim()
          : defaultSeoSettings.description,

      author:
        typeof body.author === "string"
          ? body.author.trim()
          : defaultSeoSettings.author,

      keywords,

      siteUrl:
        typeof body.siteUrl === "string"
          ? body.siteUrl.trim()
          : defaultSeoSettings.siteUrl,

      canonicalUrl:
        typeof body.canonicalUrl === "string"
          ? body.canonicalUrl.trim()
          : defaultSeoSettings.canonicalUrl,

      ogTitle:
        typeof body.ogTitle === "string"
          ? body.ogTitle.trim()
          : defaultSeoSettings.ogTitle,

      ogDescription:
        typeof body.ogDescription === "string"
          ? body.ogDescription.trim()
          : defaultSeoSettings.ogDescription,

      ogImage:
        typeof body.ogImage === "string"
          ? body.ogImage.trim()
          : defaultSeoSettings.ogImage,

      twitterCard:
        typeof body.twitterCard === "string"
          ? body.twitterCard
          : defaultSeoSettings.twitterCard,

      robotsIndex:
        typeof body.robotsIndex === "boolean"
          ? body.robotsIndex
          : defaultSeoSettings.robotsIndex,

      robotsFollow:
        typeof body.robotsFollow === "boolean"
          ? body.robotsFollow
          : defaultSeoSettings.robotsFollow,
    };

    await adminDb
      .collection("site")
      .doc("seo")
      .set(
        {
          ...settings,
          updatedAt: new Date(),
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
      "Failed to save SEO settings:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to save SEO settings.";

    const status =
      message.includes(
        "Administrator access required"
      ) ||
      message.includes(
        "Missing authentication"
      )
        ? 401
        : 500;

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      }
    );
  }
}