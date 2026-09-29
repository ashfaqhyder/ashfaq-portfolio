import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

interface PreviewDocument {
  [key: string]: unknown;
  id: string;
  displayOrder?: number;
  published?: boolean;
}

function getBearerToken(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.substring(7);
}

async function verifyAdmin(
  request: NextRequest
) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Unauthorized.");
  }

  const decodedToken =
    await adminAuth.verifyIdToken(token);

  if (decodedToken.admin !== true) {
    throw new Error(
      "Admin access required."
    );
  }

  return decodedToken;
}

function mapAndSort(
  snapshot: FirebaseFirestore.QuerySnapshot
): PreviewDocument[] {
  return snapshot.docs
    .map(
      (document) =>
        ({
          id: document.id,
          ...document.data(),
        }) as PreviewDocument
    )
    .sort(
      (a, b) =>
        Number(a.displayOrder ?? 0) -
        Number(b.displayOrder ?? 0)
    );
}

export async function GET(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    const [
      projectsSnapshot,
      experienceSnapshot,
      achievementsSnapshot,
      skillsSnapshot,
      photographySnapshot,
      creativeLabSnapshot,
      digitalLabSnapshot,
      homepageSnapshot,
      aboutSnapshot,
    ] = await Promise.all([
      adminDb.collection("projects").get(),
      adminDb.collection("experience").get(),
      adminDb.collection("achievements").get(),
      adminDb.collection("skills").get(),
      adminDb.collection("photography").get(),
      adminDb.collection("creativeLab").get(),
      adminDb.collection("digitalLab").get(),
      adminDb
        .collection("site")
        .doc("homepage")
        .get(),
      adminDb
        .collection("site")
        .doc("about")
        .get(),
    ]);

    const projects =
      mapAndSort(projectsSnapshot);

    const experience =
      mapAndSort(experienceSnapshot);

    const achievements =
      mapAndSort(achievementsSnapshot);

    const skills =
      mapAndSort(skillsSnapshot);

    const photography =
      mapAndSort(photographySnapshot);

    const creativeLab =
      mapAndSort(creativeLabSnapshot);

    const digitalLab =
      mapAndSort(digitalLabSnapshot);

    const homepage =
      homepageSnapshot.exists
        ? {
            id: homepageSnapshot.id,
            ...homepageSnapshot.data(),
          }
        : null;

    const about =
      aboutSnapshot.exists
        ? {
            id: aboutSnapshot.id,
            ...aboutSnapshot.data(),
          }
        : null;

    return NextResponse.json({
      success: true,

      preview: {
        homepage,
        about,

        projects,
        experience,
        achievements,
        skills,
        photography,
        creativeLab,
        digitalLab,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load preview:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load preview.";

    let status = 500;

    if (message === "Unauthorized.") {
      status = 401;
    }

    if (
      message === "Admin access required."
    ) {
      status = 403;
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status }
    );
  }
}