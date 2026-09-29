"use client";

import { useEffect, useState } from "react";

import {
  Experience as ExperienceType,
  getPublishedExperience,
} from "@/services/experience";

export default function Experience() {
  const [experiences, setExperiences] = useState<
    ExperienceType[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperience() {
      try {
        const data = await getPublishedExperience();
        setExperiences(data);
      } catch (error) {
        console.error(
          "Failed to load experience:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, []);

  return (
    <section
      id="experience"
      className="border-t border-neutral-900 px-6 py-24 md:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.25em] text-neutral-600">
            05 / EXPERIENCE
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
            Where I&apos;ve been
            <span className="text-neutral-600">.</span>
          </h2>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="border-t border-neutral-900 py-10 text-sm text-neutral-600">
            Loading experience...
          </div>
        )}

        {/* EMPTY */}
        {!loading && experiences.length === 0 && (
          <div className="border-t border-neutral-900 py-10 text-sm text-neutral-600">
            Experience details are currently being
            updated.
          </div>
        )}

        {/* EXPERIENCE */}
        {!loading && experiences.length > 0 && (
          <div className="space-y-5">
            {experiences.map((experience) => {
              const current =
                experience.currentlyWorking;

              return (
                <article
                  key={experience.id}
                  className="group relative overflow-hidden rounded-2xl border transition-all duration-500"
                  style={{
                    borderColor: current
                      ? "color-mix(in srgb, var(--portfolio-accent) 30%, transparent)"
                      : undefined,
                    backgroundColor: current
                      ? "color-mix(in srgb, var(--portfolio-accent) 3.5%, transparent)"
                      : "var(--portfolio-surface)",
                  }}
                >
                  {/* CURRENT INDICATOR */}
                  {current && (
                    <div className="absolute right-6 top-6 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                          style={{
                            backgroundColor:
                              "var(--portfolio-accent)",
                          }}
                        />

                        <span
                          className="relative inline-flex h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              "var(--portfolio-accent)",
                          }}
                        />
                      </span>

                      <span
                        className="text-[10px] font-medium tracking-[0.2em]"
                        style={{
                          color:
                            "var(--portfolio-accent)",
                        }}
                      >
                        CURRENT
                      </span>
                    </div>
                  )}

                  <div className="p-7 md:p-10">
                    <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
                      {/* DATE */}
                      <div className="text-sm text-neutral-600">
                        <p>{experience.startDate}</p>

                        <p
                          style={{
                            color: current
                              ? "var(--portfolio-accent)"
                              : undefined,
                          }}
                        >
                          — {current
                            ? "Present"
                            : experience.endDate}
                        </p>
                      </div>

                      {/* CONTENT */}
                      <div>
                        <div className="flex items-start gap-5">
                          {/* LOGO */}
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                            style={{
                              borderColor: current
                                ? "color-mix(in srgb, var(--portfolio-accent) 20%, transparent)"
                                : "#262626",
                              backgroundColor:
                                current
                                  ? "color-mix(in srgb, var(--portfolio-accent) 5%, transparent)"
                                  : "#0a0a0a",
                            }}
                          >
                            {experience.organizationLogoUrl ? (
                              <img
                                src={
                                  experience.organizationLogoUrl
                                }
                                alt=""
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span
                                className="text-sm font-medium"
                                style={{
                                  color: current
                                    ? "var(--portfolio-accent)"
                                    : "var(--portfolio-muted)",
                                }}
                              >
                                {experience.organization
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-neutral-500">
                              {experience.organization}
                            </p>

                            <h3 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">
                              {experience.role}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-7 max-w-3xl">
                          <p className="leading-7 text-neutral-400">
                            {experience.description}
                          </p>
                        </div>

                        {/* RESPONSIBILITIES */}
                        {experience.responsibilities?.length >
                          0 && (
                          <ul className="mt-7 space-y-3">
                            {experience.responsibilities.map(
                              (
                                responsibility,
                                responsibilityIndex
                              ) => (
                                <li
                                  key={
                                    responsibilityIndex
                                  }
                                  className="flex gap-3 text-sm leading-6 text-neutral-500"
                                >
                                  <span
                                    style={{
                                      color: current
                                        ? "var(--portfolio-accent)"
                                        : "var(--portfolio-muted)",
                                    }}
                                  >
                                    /
                                  </span>

                                  <span>
                                    {responsibility}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        )}

                        {/* TAGS */}
                        <div className="mt-8 flex flex-wrap gap-2">
                          {experience.technologies?.map(
                            (technology) => (
                              <span
                                key={technology}
                                className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-500 transition group-hover:border-neutral-700"
                              >
                                {technology}
                              </span>
                            )
                          )}
                        </div>

                        {/* META */}
                        <div className="mt-8 flex flex-wrap gap-4 text-xs text-neutral-600">
                          {experience.type && (
                            <span>
                              {experience.type}
                            </span>
                          )}

                          {experience.location && (
                            <>
                              <span>/</span>

                              <span>
                                {experience.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HOVER LINE */}
                  <div
                    className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                    style={{
                      backgroundColor: current
                        ? "var(--portfolio-accent)"
                        : "var(--portfolio-text)",
                    }}
                  />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}