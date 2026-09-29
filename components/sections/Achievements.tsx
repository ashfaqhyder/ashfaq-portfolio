"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Award,
  ExternalLink,
} from "lucide-react";

import {
  Achievement,
  getPublishedAchievements,
} from "@/services/achievements";

export default function Achievements() {
  const [achievements, setAchievements] = useState<
    Achievement[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);

        const data =
          await getPublishedAchievements();

        setAchievements(data);
      } catch (error) {
        console.error(
          "Failed to load achievements:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, []);

  return (
    <section
      id="achievements"
      className="relative border-t border-neutral-900 bg-[#050505] px-6 py-24 text-white md:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p
              className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-600"
            >
              03 / Achievements
            </p>

            <h2 className="max-w-3xl text-4xl font-medium tracking-tight md:text-6xl lg:text-7xl">
              Recognition &
              <br />
              <span className="text-neutral-500">
                milestones.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-neutral-600 md:text-right">
            Certifications, hackathons, research and
            milestones that have shaped my journey
            across technology and creative development.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* LOADING                                                          */}
        {/* ---------------------------------------------------------------- */}

        {loading && (
          <div className="border-t border-neutral-900">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid animate-pulse gap-8 border-b border-neutral-900 py-10 md:grid-cols-[80px_1fr_220px] md:items-center lg:grid-cols-[100px_1fr_260px]"
              >
                <div className="h-3 w-8 rounded bg-neutral-900" />

                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-900" />

                  <div className="flex-1">
                    <div className="h-2.5 w-24 rounded bg-neutral-900" />

                    <div className="mt-4 h-6 w-2/3 rounded bg-neutral-900" />

                    <div className="mt-3 h-3 w-1/3 rounded bg-neutral-900" />
                  </div>
                </div>

                <div className="h-3 w-20 rounded bg-neutral-900 md:ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* EMPTY STATE                                                      */}
        {/* ---------------------------------------------------------------- */}

        {!loading && achievements.length === 0 && (
          <div className="border-t border-neutral-900">
            <div className="border-b border-neutral-900 py-20">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-900 bg-[#080808]">
                <Award
                  size={20}
                  strokeWidth={1}
                  className="text-neutral-700"
                />
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-neutral-700">
                Currently updating
              </p>

              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">
                Certifications, hackathons, research and
                other milestones will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* ACHIEVEMENTS                                                     */}
        {/* ---------------------------------------------------------------- */}

        {!loading && achievements.length > 0 && (
          <div className="border-t border-neutral-900">
            {achievements.map(
              (achievement, index) => (
                <AchievementCard
                  key={
                    achievement.id ??
                    `${achievement.title}-${index}`
                  }
                  achievement={achievement}
                  index={index}
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ========================================================================= */
/* ACHIEVEMENT CARD                                                          */
/* ========================================================================= */

function AchievementCard({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const [logoError, setLogoError] =
    useState(false);

  const initials =
    getOrganizationInitials(
      achievement.organization
    );

  const hasLogo =
    Boolean(
      achievement.organizationLogoUrl
    ) && !logoError;

  return (
    <article className="group relative border-b border-neutral-900 py-8 transition-colors duration-500 md:py-10">
      <div className="grid gap-8 md:grid-cols-[80px_1fr_220px] md:items-center lg:grid-cols-[100px_1fr_260px]">
        {/* ---------------------------------------------------------------- */}
        {/* NUMBER                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-700">
            {String(index + 1).padStart(2, "0")}
          </span>

          {achievement.featured && (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  "var(--portfolio-accent)",
              }}
              aria-label="Featured achievement"
            />
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MAIN CONTENT                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div className="min-w-0">
          <div className="flex items-start gap-5">
            {/* Organization Logo */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-[#090909] transition-all duration-500 group-hover:border-neutral-700">
              {hasLogo ? (
                <img
                  src={
                    achievement.organizationLogoUrl
                  }
                  alt={`${achievement.organization} logo`}
                  loading="lazy"
                  className="h-full w-full object-contain p-2.5"
                  onError={() =>
                    setLogoError(true)
                  }
                />
              ) : (
                <span className="text-xs font-medium tracking-[0.15em] text-neutral-600">
                  {initials}
                </span>
              )}
            </div>

            {/* Text */}

            <div className="min-w-0 flex-1">
              {/* Type + Featured */}

              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">
                  {achievement.type}
                </span>

                {achievement.featured && (
                  <span
                    className="rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor:
                        "var(--portfolio-accent)",
                      color:
                        "var(--portfolio-accent)",
                    }}
                  >
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}

              <h3 className="text-xl font-medium leading-tight tracking-tight text-white transition-colors duration-300 group-hover:text-[var(--portfolio-accent)] md:text-2xl">
                {achievement.title}
              </h3>

              {/* Organization */}

              <p className="mt-2 text-sm text-neutral-500">
                {achievement.organization}
              </p>

              {/* Description */}

              {achievement.description && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 transition-colors duration-300 group-hover:text-neutral-500">
                  {achievement.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* META                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 md:items-end">
          {/* Date */}

          <span className="text-xs text-neutral-600">
            {achievement.date}
          </span>

          {/* Verification */}

          {achievement.verificationUrl && (
            <a
              href={
                achievement.verificationUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="group/verify inline-flex w-fit items-center gap-2 border-b border-neutral-800 pb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-300 hover:text-[var(--portfolio-accent)]"
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor =
                  "var(--portfolio-accent)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor =
                  "#262626";
              }}
            >
              <ExternalLink
                size={12}
                strokeWidth={1.5}
              />

              <span>
                Verify Certificate
              </span>

              <ArrowUpRight
                size={12}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover/verify:-translate-y-0.5 group-hover/verify:translate-x-0.5"
              />
            </a>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* HOVER LINE                                                       */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-700 ease-out group-hover:w-full"
        style={{
          backgroundColor:
            "var(--portfolio-accent)",
        }}
      />
    </article>
  );
}

/* ========================================================================= */
/* ORGANIZATION INITIALS                                                    */
/* ========================================================================= */

function getOrganizationInitials(
  organization: string
) {
  const words = organization
    .replace(/[×&]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "ORG";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}