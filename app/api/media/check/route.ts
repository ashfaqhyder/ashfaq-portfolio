import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
  ".ogg",
  ".pdf",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedPath = body?.path;

    if (
      typeof requestedPath !== "string" ||
      !requestedPath.trim()
    ) {
      return NextResponse.json(
        {
          exists: false,
          error: "A file path is required.",
        },
        { status: 400 }
      );
    }

    let cleanPath = requestedPath.trim();

    if (!cleanPath.startsWith("/")) {
      return NextResponse.json(
        {
          exists: false,
          error: "Path must start with /.",
        },
        { status: 400 }
      );
    }

    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch {
      return NextResponse.json(
        {
          exists: false,
          error: "Invalid file path.",
        },
        { status: 400 }
      );
    }

    const relativePath = cleanPath.replace(/^\/+/, "");

    /*
     * Prevent directory traversal.
     */
    if (
      relativePath.includes("..") ||
      relativePath.includes("\\")
    ) {
      return NextResponse.json(
        {
          exists: false,
          error: "Invalid file path.",
        },
        { status: 400 }
      );
    }

    if (!relativePath) {
      return NextResponse.json(
        {
          exists: false,
          error: "A file path is required.",
        },
        { status: 400 }
      );
    }

    const extension = path
      .extname(relativePath)
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          exists: false,
          error: "Unsupported file type.",
        },
        { status: 400 }
      );
    }

    const publicDirectory = path.resolve(
      process.cwd(),
      "public"
    );

    const filePath = path.resolve(
      publicDirectory,
      relativePath
    );

    /*
     * Final security check to ensure the requested
     * path cannot escape the public directory.
     */
    if (
      filePath !== publicDirectory &&
      !filePath.startsWith(
        `${publicDirectory}${path.sep}`
      )
    ) {
      return NextResponse.json(
        {
          exists: false,
          error: "Invalid file path.",
        },
        { status: 400 }
      );
    }

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return NextResponse.json({
          exists: false,
          path: cleanPath,
          error: "The path does not point to a file.",
        });
      }

      return NextResponse.json({
        exists: true,
        path: cleanPath,
        fileName: path.basename(filePath),
        extension,
        size: stats.size,
      });
    } catch {
      return NextResponse.json({
        exists: false,
        path: cleanPath,
        error:
          "File not found in the public directory.",
      });
    }
  } catch (error) {
    console.error(
      "Media file check failed:",
      error
    );

    return NextResponse.json(
      {
        exists: false,
        error: "Unable to check the file.",
      },
      { status: 500 }
    );
  }
}