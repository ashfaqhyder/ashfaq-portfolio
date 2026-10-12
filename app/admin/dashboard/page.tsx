"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/auth";

import {
  getProjects,
  Project,
} from "@/services/projects";

import {
  getAchievements,
  Achievement,
} from "@/services/achievements";

import {
  getExperience,
  Experience,
} from "@/services/experience";

import {
  getHomepageSettings,
} from "@/services/homepage";

import {
  getSkills,
  Skill,
} from "@/services/skills";

import {
  getPublishedPhotography,
} from "@/services/photography";

import {
  getPublishedCreativeLabItems,
} from "@/services/creativeLab";

import {
  getPublishedDigitalLabItems,
} from "@/services/digitalLab";

import {
  getMedia,
  MediaItem,
} from "@/services/media";

interface DashboardStats {
  projects: number;
  publishedProjects: number;

  experience: number;
  publishedExperience: number;

  achievements: number;
  publishedAchievements: number;

  skills: number;
  publishedSkills: number;

  photography: number;
  creativeLab: number;
  digitalLab: number;

  media: number;

  publishedTotal: number;

  homepageConfigured: boolean;
}

const defaultStats: DashboardStats = {
  projects: 0,
  publishedProjects: 0,

  experience: 0,
  publishedExperience: 0,

  achievements: 0,
  publishedAchievements: 0,

  skills: 0,
  publishedSkills: 0,

  photography: 0,
  creativeLab: 0,
  digitalLab: 0,

  media: 0,

  publishedTotal: 0,

  homepageConfigured: false,
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [checking, setChecking] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>(defaultStats);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [experiences, setExperiences] =
    useState<Experience[]>([]);

  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * --------------------------------------------------
   * AUTHENTICATION
   * --------------------------------------------------
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace("/admin/login");
            return;
          }

          try {
            const tokenResult =
              await currentUser.getIdTokenResult();

            if (
              tokenResult.claims.admin !== true
            ) {
              router.replace("/admin/login");
              return;
            }

            setUser(currentUser);
            setChecking(false);
          } catch {
            router.replace("/admin/login");
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  /*
   * --------------------------------------------------
   * LOAD DASHBOARD
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!checking && user) {
      void loadDashboard();
    }
  }, [checking, user]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        projectData,
        experienceData,
        achievementData,
        homepageData,
        skillData,
        photographyData,
        creativeLabData,
        digitalLabData,
        mediaData,
      ] = await Promise.all([
        getProjects(),
        getExperience(),
        getAchievements(),
        getHomepageSettings(),
        getSkills(),
        getPublishedPhotography(),
        getPublishedCreativeLabItems(),
        getPublishedDigitalLabItems(),
        getMedia(),
      ]);

      const publishedProjects =
        projectData.filter(
          (item) => item.published
        );

      const publishedExperience =
        experienceData.filter(
          (item) => item.published
        );

      const publishedAchievements =
        achievementData.filter(
          (item) => item.published
        );

      const publishedSkills =
        skillData.filter(
          (item) => item.published
        );

      setProjects(projectData);
      setExperiences(experienceData);
      setAchievements(achievementData);

      setStats({
        projects: projectData.length,
        publishedProjects:
          publishedProjects.length,

        experience: experienceData.length,
        publishedExperience:
          publishedExperience.length,

        achievements:
          achievementData.length,
        publishedAchievements:
          publishedAchievements.length,

        skills: skillData.length,
        publishedSkills:
          publishedSkills.length,

        photography:
          photographyData.length,

        creativeLab:
          creativeLabData.length,

        digitalLab:
          digitalLabData.length,

        media: mediaData.length,

        publishedTotal:
          publishedProjects.length +
          publishedExperience.length +
          publishedAchievements.length +
          publishedSkills.length +
          photographyData.length +
          creativeLabData.length +
          digitalLabData.length,

        homepageConfigured:
          homepageData !== undefined,
      });
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * DERIVED DATA
   * --------------------------------------------------
   */

  const currentExperience =
    experiences.find(
      (experience) =>
        experience.currentlyWorking === true &&
        experience.published === true
    );

  const recentProjects =
    [...projects]
      .sort(
        (a, b) =>
          a.displayOrder -
          b.displayOrder
      )
      .slice(0, 3);

  const recentAchievements =
    [...achievements]
      .sort(
        (a, b) =>
          a.displayOrder -
          b.displayOrder
      )
      .slice(0, 3);

  /*
   * --------------------------------------------------
   * AUTH LOADING
   * --------------------------------------------------
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm text-neutral-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * PAGE
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 md:px-10 lg:px-14 lg:py-14">

        {/* HEADER */}

        <header className="border-b border-neutral-900 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-neutral-600">
            ASHFAQ HYDER / ADMIN
          </p>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Dashboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Your portfolio at a glance.
                Manage content, experience,
                creative work and published
                content from one place.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-neutral-600">
                Signed in as
              </p>

              <p className="mt-1 text-sm text-neutral-400">
                {user?.email}
              </p>
            </div>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* PRIMARY STATS */}

        <section className="mt-10">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-neutral-900 bg-transparent md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              label="PROJECTS"
              value={stats.projects}
              detail={`${stats.publishedProjects} published`}
              href="/admin/projects"
              loading={loading}
            />

            <StatCard
              label="EXPERIENCE"
              value={stats.experience}
              detail={`${stats.publishedExperience} published`}
              href="/admin/experience"
              loading={loading}
            />

            <StatCard
              label="ACHIEVEMENTS"
              value={stats.achievements}
              detail={`${stats.publishedAchievements} published`}
              href="/admin/achievements"
              loading={loading}
            />

            <StatCard
              label="PUBLISHED CONTENT"
              value={stats.publishedTotal}
              detail="Across portfolio"
              loading={loading}
            />

          </div>
        </section>

        {/* EXTENDED CONTENT */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] tracking-[0.25em] text-neutral-700">
              CONTENT OVERVIEW
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Everything in your portfolio
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <ContentCard
              label="Skills"
              value={stats.skills}
              detail={`${stats.publishedSkills} published`}
              href="/admin/skills"
              loading={loading}
            />

            <ContentCard
              label="Photography"
              value={stats.photography}
              detail="Published photographs"
              loading={loading}
            />

            <ContentCard
              label="Creative Lab"
              value={stats.creativeLab}
              detail="Published experiments"
              href="/admin/creative-lab"
              loading={loading}
            />

            <ContentCard
              label="Digital Lab"
              value={stats.digitalLab}
              detail="Published experiments"
              href="/admin/digital-lab"
              loading={loading}
            />

            <ContentCard
              label="Media Library"
              value={stats.media}
              detail="Registered assets"
              href="/admin/media"
              loading={loading}
            />

          </div>
        </section>

        {/* CURRENT EXPERIENCE */}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-neutral-700">
                CURRENT EXPERIENCE
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Where you are now
              </h2>
            </div>

            <Link
              href="/admin/experience"
              className="text-xs text-neutral-600 transition hover:text-white"
            >
              Manage →
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-neutral-900 bg-transparent p-8 text-sm text-neutral-600">
              Loading current experience...
            </div>
          ) : currentExperience ? (
            <div className="group relative overflow-hidden rounded-2xl border border-[#B6FF3B]/25 bg-transparent p-7 transition hover:border-[#B6FF3B]/50 md:p-9">

              <div className="absolute right-7 top-7 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B6FF3B] opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B6FF3B]" />
                </span>

                <span className="text-[9px] tracking-[0.25em] text-[#B6FF3B]">
                  CURRENT
                </span>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm text-neutral-500">
                  {currentExperience.organization}
                </p>

                <h3 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
                  {currentExperience.role}
                </h3>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-600">
                  <span>
                    {currentExperience.startDate}
                  </span>

                  <span>/</span>

                  <span className="text-[#B6FF3B]">
                    Present
                  </span>

                  {currentExperience.location && (
                    <>
                      <span>/</span>

                      <span>
                        {currentExperience.location}
                      </span>
                    </>
                  )}
                </div>

                {currentExperience.description && (
                  <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500">
                    {currentExperience.description}
                  </p>
                )}
              </div>

              <div className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#B6FF3B] transition-transform duration-700 group-hover:scale-x-100" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-900 bg-transparent p-8">
              <p className="text-sm text-neutral-500">
                No current experience is marked.
              </p>

              <Link
                href="/admin/experience"
                className="mt-4 inline-block text-sm text-[#B6FF3B] hover:underline"
              >
                Add your current role →
              </Link>
            </div>
          )}
        </section>

        {/* PORTFOLIO HEALTH */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] tracking-[0.25em] text-neutral-700">
              PUBLIC VISIBILITY
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Portfolio health
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <StatusCard
              label="Homepage"
              status={
                stats.homepageConfigured
                  ? "Configured"
                  : "Needs attention"
              }
              good={
                stats.homepageConfigured
              }
              href="/admin/homepage"
            />

            <StatusCard
              label="Projects"
              status={`${stats.publishedProjects} published`}
              good={
                stats.publishedProjects > 0
              }
              href="/admin/projects"
            />

            <StatusCard
              label="Experience"
              status={`${stats.publishedExperience} published`}
              good={
                stats.publishedExperience > 0
              }
              href="/admin/experience"
            />

            <StatusCard
              label="Achievements"
              status={`${stats.publishedAchievements} published`}
              good={
                stats.publishedAchievements > 0
              }
              href="/admin/achievements"
            />

          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] tracking-[0.25em] text-neutral-700">
              QUICK ACTIONS
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Update your portfolio
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <QuickAction
              href="/admin/projects"
              label="Add Project"
              description="Create a new project"
            />

            <QuickAction
              href="/admin/experience"
              label="Add Experience"
              description="Add a role or internship"
            />

            <QuickAction
              href="/admin/achievements"
              label="Add Achievement"
              description="Add a certificate or event"
            />

            <QuickAction
              href="/admin/homepage"
              label="Edit Homepage"
              description="Update hero and introduction"
            />

          </div>
        </section>

        {/* RECENT CONTENT */}

        <section className="mt-10 grid gap-6 xl:grid-cols-2">

          {/* PROJECTS */}

          <RecentPanel
            eyebrow="PROJECTS"
            title="Recent projects"
            href="/admin/projects"
            loading={loading}
            emptyMessage="No projects yet."
            items={recentProjects.map(
              (project) => ({
                id: project.id,
                title: project.title,
                meta: project.category,
                published: project.published,
              })
            )}
          />

          {/* ACHIEVEMENTS */}

          <RecentPanel
            eyebrow="ACHIEVEMENTS"
            title="Recent achievements"
            href="/admin/achievements"
            loading={loading}
            emptyMessage="No achievements yet."
            items={recentAchievements.map(
              (achievement) => ({
                id: achievement.id,
                title: achievement.title,
                meta: achievement.organization,
                published: achievement.published,
              })
            )}
          />

        </section>

        {/* FOOTER */}

        <footer className="mt-14 flex flex-col gap-3 border-t border-neutral-900 pt-7 text-xs text-neutral-700 md:flex-row md:items-center md:justify-between">
          <p>
            ASHFAQ HYDER / PORTFOLIO CMS
          </p>

          <Link
            href="/"
            target="_blank"
            className="transition hover:text-white"
          >
            View live portfolio ↗
          </Link>
        </footer>

      </div>
    </main>
  );
}

/* -------------------------------------------------- */
/* STAT CARD */
/* -------------------------------------------------- */

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  href?: string;
  loading: boolean;
}

function StatCard({
  label,
  value,
  detail,
  href,
  loading,
}: StatCardProps) {
  const content = (
    <div className="bg-transparent p-6 transition hover:bg-transparent">
      <p className="text-[9px] tracking-[0.2em] text-neutral-700">
        {label}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-4xl font-medium tracking-tight">
          {loading ? "—" : value}
        </p>

        <p className="text-right text-[10px] text-neutral-600">
          {loading ? "Loading" : detail}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

/* -------------------------------------------------- */
/* CONTENT CARD */
/* -------------------------------------------------- */

interface ContentCardProps {
  label: string;
  value: number;
  detail: string;
  href?: string;
  loading: boolean;
}

function ContentCard({
  label,
  value,
  detail,
  href,
  loading,
}: ContentCardProps) {
  const content = (
    <div className="group rounded-2xl border border-neutral-900 bg-transparent p-6 transition hover:border-neutral-700 hover:bg-transparent">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-neutral-400">
          {label}
        </p>

        {href && (
          <span className="text-neutral-800 transition group-hover:text-neutral-500">
            ↗
          </span>
        )}
      </div>

      <p className="mt-7 text-3xl font-medium tracking-tight">
        {loading ? "—" : value}
      </p>

      <p className="mt-2 text-xs text-neutral-600">
        {loading ? "Loading" : detail}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

/* -------------------------------------------------- */
/* STATUS CARD */
/* -------------------------------------------------- */

interface StatusCardProps {
  label: string;
  status: string;
  good: boolean;
  href: string;
}

function StatusCard({
  label,
  status,
  good,
  href,
}: StatusCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-900 bg-transparent p-5 transition hover:border-neutral-700"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {label}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${
            good
              ? "bg-[#B6FF3B]"
              : "bg-neutral-700"
          }`}
        />
      </div>

      <p
        className={`mt-4 text-xs ${
          good
            ? "text-[#B6FF3B]"
            : "text-neutral-600"
        }`}
      >
        {status}
      </p>

      <p className="mt-4 text-[10px] text-neutral-700 transition group-hover:text-neutral-500">
        Manage →
      </p>
    </Link>
  );
}

/* -------------------------------------------------- */
/* QUICK ACTION */
/* -------------------------------------------------- */

interface QuickActionProps {
  href: string;
  label: string;
  description: string;
}

function QuickAction({
  href,
  label,
  description,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-900 bg-transparent p-6 transition hover:border-neutral-700 hover:bg-transparent"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-sm text-neutral-400 transition group-hover:border-neutral-600 group-hover:text-white">
          +
        </span>

        <span className="text-neutral-800 transition group-hover:text-neutral-500">
          ↗
        </span>
      </div>

      <h3 className="mt-6 text-sm font-medium">
        {label}
      </h3>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        {description}
      </p>
    </Link>
  );
}

/* -------------------------------------------------- */
/* RECENT PANEL */
/* -------------------------------------------------- */

interface RecentItem {
  id?: string;
  title: string;
  meta: string;
  published: boolean;
}

interface RecentPanelProps {
  eyebrow: string;
  title: string;
  href: string;
  loading: boolean;
  emptyMessage: string;
  items: RecentItem[];
}

function RecentPanel({
  eyebrow,
  title,
  href,
  loading,
  emptyMessage,
  items,
}: RecentPanelProps) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-transparent">

      <div className="flex items-center justify-between border-b border-neutral-900 px-6 py-5">

        <div>
          <p className="text-[10px] tracking-[0.2em] text-neutral-700">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-medium">
            {title}
          </h2>
        </div>

        <Link
          href={href}
          className="text-xs text-neutral-600 transition hover:text-white"
        >
          View all →
        </Link>

      </div>

      <div>
        {loading ? (
          <div className="p-6 text-sm text-neutral-600">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-neutral-600">
            {emptyMessage}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={
                item.id ??
                `${item.title}-${index}`
              }
              className={`flex items-center justify-between gap-5 px-6 py-5 ${
                index !== items.length - 1
                  ? "border-b border-neutral-900"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-neutral-300">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-neutral-700">
                  {item.meta}
                </p>
              </div>

              <span
                className={`shrink-0 text-[9px] tracking-[0.15em] ${
                  item.published
                    ? "text-[#B6FF3B]"
                    : "text-neutral-700"
                }`}
              >
                {item.published
                  ? "PUBLISHED"
                  : "DRAFT"}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}