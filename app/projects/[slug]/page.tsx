import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

import {
  getPublishedProjects,
  Project,
} from "@/services/projects";

interface ProjectCaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectCaseStudyPage({
  params,
}: ProjectCaseStudyPageProps) {
  const { slug } = await params;

  const projects = await getPublishedProjects();

  const project = projects.find(
    (item) => item.slug === slug
  );

  if (!project) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-24 text-white md:px-10 lg:px-16">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center">
          <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-neutral-600">
            404 / Project
          </p>

          <h1 className="max-w-3xl text-5xl font-medium tracking-tight md:text-7xl">
            Project not found.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500">
            The project you're looking for doesn't exist or is
            no longer published.
          </p>

          <div className="mt-10">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-3 text-xs uppercase tracking-wider text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.5}
              />
              Back to Projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Top Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10 lg:px-16">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition-colors duration-300 hover:text-white"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Projects
        </Link>

        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
          Case Study
        </span>
      </div>

      {/* Hero */}
      <section className="px-6 pb-20 pt-14 md:px-10 md:pb-28 lg:px-16 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.35fr] lg:items-end">
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                  {project.category}
                </span>

                <span className="h-px w-8 bg-neutral-800" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
                  {String(project.displayOrder).padStart(
                    2,
                    "0"
                  )}
                </span>

                {project.featured && (
                  <>
                    <span className="h-px w-8 bg-neutral-800" />

                    <span
                      className="text-[10px] uppercase tracking-[0.25em]"
                      style={{
                        color:
                          "var(--portfolio-accent)",
                      }}
                    >
                      Featured
                    </span>
                  </>
                )}
              </div>

              <h1 className="max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-[8rem]">
                {project.title}
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="text-sm leading-7 text-neutral-500">
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Project Visual */}
      <section className="px-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {project.imageUrl ? (
            <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-900 bg-[#090909]">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl border border-neutral-900 bg-[#090909]">
              <div className="absolute inset-0">
                <div className="absolute left-[10%] top-[25%] h-px w-[80%] bg-neutral-900" />
                <div className="absolute left-[18%] top-[50%] h-px w-[64%] bg-neutral-800" />
                <div className="absolute left-[10%] top-[75%] h-px w-[80%] bg-neutral-900" />

                <div className="absolute left-[20%] top-[10%] h-[80%] w-px bg-neutral-900" />
                <div className="absolute left-[50%] top-[8%] h-[84%] w-px bg-neutral-800" />
                <div className="absolute left-[80%] top-[10%] h-[80%] w-px bg-neutral-900" />
              </div>

              <div className="relative text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-700">
                  {project.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Information */}
      <section className="px-6 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.35fr_1fr]">
          {/* Metadata */}
          <aside>
            <p className="mb-7 text-[10px] uppercase tracking-[0.3em] text-neutral-600">
              Project Information
            </p>

            <div className="space-y-7">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-700">
                  Category
                </p>

                <p className="text-sm text-neutral-300">
                  {project.category}
                </p>
              </div>

              {project.featured && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-700">
                    Status
                  </p>

                  <p
                    className="text-sm"
                    style={{
                      color:
                        "var(--portfolio-accent)",
                    }}
                  >
                    Featured Project
                  </p>
                </div>
              )}

              {/* Technologies as text */}
              {project.technologies?.length > 0 && (
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-700">
                    Technologies
                  </p>

                  <div className="space-y-2">
                    {project.technologies.map(
                      (technology) => (
                        <p
                          key={technology}
                          className="text-sm text-neutral-300"
                        >
                          {technology}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Description */}
          <article>
            <p className="mb-7 text-[10px] uppercase tracking-[0.3em] text-neutral-600">
              About the Project
            </p>

            <div className="max-w-4xl">
              <p className="text-2xl leading-[1.5] tracking-tight text-neutral-200 md:text-3xl lg:text-4xl">
                {project.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-wrap items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-3 text-xs uppercase tracking-wider text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                >
                  <ExternalLink
                    size={14}
                    strokeWidth={1.5}
                  />
                  View on GitHub
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.5}
                  />
                </a>
              )}

              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-900 px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 transition-all duration-300 hover:border-neutral-700 hover:text-white"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.5}
                />
                All Projects
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            Ashfaq Hyder
          </span>

          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
            CODE × DESIGN × INTELLIGENCE
          </span>
        </div>
      </footer>
    </main>
  );
}