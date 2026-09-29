"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getPreviewData,
} from "@/services/preview";


import type {
  PreviewData,
} from "@/services/preview";

export default function PreviewPage() {
  const [preview, setPreview] =
    useState<PreviewData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await getPreviewData();

        setPreview(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load preview."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-neutral-500">
            Loading preview...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
            CMS / PREVIEW
          </p>

          <h1 className="text-4xl font-semibold">
            Preview unavailable
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            {error}
          </p>

          <Link
            href="/admin"
            className="mt-8 inline-block border border-neutral-700 px-5 py-3 text-xs uppercase tracking-[0.18em] transition hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)]"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!preview) {
    return null;
  }

  const collections = [
    {
      label: "Projects",
      items: preview.projects,
    },
    {
      label: "Experience",
      items: preview.experience,
    },
    {
      label: "Achievements",
      items: preview.achievements,
    },
    {
      label: "Skills",
      items: preview.skills,
    },
    {
      label: "Photography",
      items: preview.photography,
    },
    {
      label: "Creative Lab",
      items: preview.creativeLab,
    },
    {
      label: "Digital Lab",
      items: preview.digitalLab,
    },
  ];

  const getTitle = (
    item: Record<string, unknown>
  ) => {
    if (typeof item.title === "string") {
      return item.title;
    }

    if (typeof item.name === "string") {
      return item.name;
    }

    if (
      typeof item.organization === "string"
    ) {
      return item.organization;
    }

    return "Untitled";
  };

  const getPublishedStatus = (
    item: Record<string, unknown>
  ) => {
    return item.published === true;
  };

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 border-b border-neutral-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
              CMS / CONTENT PREVIEW
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Preview
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
              Review all portfolio content,
              including unpublished drafts, before
              publishing them.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit border border-neutral-700 px-5 py-3 text-xs uppercase tracking-[0.18em] transition hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)]"
          >
            Public Site ↗
          </Link>
        </header>

        <section className="mb-10 border border-[var(--portfolio-accent)] bg-neutral-950 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  "var(--portfolio-accent)",
              }}
            />

            <div>
              <p
                className="text-xs font-medium uppercase tracking-[0.2em]"
                style={{
                  color:
                    "var(--portfolio-accent)",
                }}
              >
                Preview Mode
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Unpublished CMS content is visible
                here for administrator review. This
                content is not automatically exposed
                on the public portfolio.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
              HOMEPAGE
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Homepage configuration
            </h2>
          </div>

          <div className="border border-neutral-800 bg-neutral-950 p-6">
            {preview.homepage ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-neutral-600">
                    Hero
                  </p>

                  <p className="mt-2 text-lg">
                    {String(
                      preview.homepage
                        .heroTitle ?? "Not configured"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-neutral-600">
                    Introduction
                  </p>

                  <p className="mt-2 text-lg">
                    {String(
                      preview.homepage
                        .introTitle ?? "Not configured"
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Homepage settings have not been
                configured yet.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
              CONTENT
            </p>

            <h2 className="mt-2 text-xl font-medium">
              All CMS entries
            </h2>
          </div>

          <div className="space-y-3">
            {collections.map(
              (collection) => (
                <div
                  key={collection.label}
                  className="border border-neutral-800 bg-neutral-950"
                >
                  <div className="flex items-center justify-between border-b border-neutral-900 px-5 py-4">
                    <p className="text-sm font-medium">
                      {collection.label}
                    </p>

                    <span className="text-xs text-neutral-600">
                      {collection.items.length}{" "}
                      entries
                    </span>
                  </div>

                  {collection.items.length ===
                  0 ? (
                    <div className="px-5 py-6 text-sm text-neutral-600">
                      No entries.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-900">
                      {collection.items.map(
                        (item) => {
                          const published =
                            getPublishedStatus(
                              item
                            );

                          return (
                            <div
                              key={String(
                                item.id
                              )}
                              className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm">
                                  {getTitle(item)}
                                </p>

                                {typeof item.description ===
                                  "string" &&
                                  item.description && (
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-neutral-600">
                                      {item.description}
                                    </p>
                                  )}
                              </div>

                              <span
                                className="w-fit border px-3 py-1 text-[10px] uppercase tracking-[0.15em]"
                                style={{
                                  borderColor:
                                    published
                                      ? "var(--portfolio-accent)"
                                      : "#333333",

                                  color:
                                    published
                                      ? "var(--portfolio-accent)"
                                      : "#737373",
                                }}
                              >
                                {published
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        <div className="mt-12 border-t border-neutral-900 pt-8">
          <p className="text-xs leading-6 text-neutral-600">
            Preview data is retrieved through an
            authenticated administrator endpoint.
            Draft content is not made public by this
            page.
          </p>
        </div>
      </div>
    </main>
  );
}