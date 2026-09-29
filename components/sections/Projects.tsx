"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiC,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiFirebase,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiTensorflow,
  SiPytorch,
  SiGooglecloud,
  SiDocker,
  SiGit,
  SiGithub,
  SiFigma,
  SiStreamlit,
  SiFastapi,
  SiFlask,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
} from "react-icons/si";
import {
  ArrowUpRight,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  Globe,
  Layers3,
  Server,
  Terminal,
} from "lucide-react";

import {
  getPublishedProjects,
  Project,
} from "@/services/projects";
import ScrollReveal from "@/components/motion/ScrollReveal";
import HoverTilt from "@/components/motion/HoverTilt";

type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/* -------------------------------------------------------------------------- */
/* Technology icon mapper                                                     */
/* -------------------------------------------------------------------------- */

function getTechnologyIcon(
  technology: string
): IconComponent {
  const normalized = technology
    .toLowerCase()
    .trim()
    .replace(/[._-]/g, " ");

  /* Specific technologies first */

  if (
    normalized.includes("github") ||
    normalized.includes("git hub")
  ) {
    return SiGithub;
  }

  if (
    normalized === "git" ||
    normalized.includes("git scm")
  ) {
    return SiGit;
  }

  if (
    normalized === "next js" ||
    normalized === "nextjs" ||
    normalized.includes("next js")
  ) {
    return SiNextdotjs;
  }

  if (normalized.includes("react")) {
    return SiReact;
  }

  if (
    normalized === "typescript" ||
    normalized === "ts"
  ) {
    return SiTypescript;
  }

  if (
    normalized === "javascript" ||
    normalized === "js"
  ) {
    return SiJavascript;
  }

  if (
    normalized === "python" ||
    normalized === "py"
  ) {
    return SiPython;
  }

  if (normalized === "java") {
    return Terminal;
  }

  if (
    normalized.includes("c++") ||
    normalized.includes("cplusplus")
  ) {
    return SiCplusplus;
  }

  if (
    normalized === "c" ||
    normalized === "c language"
  ) {
    return SiC;
  }

  if (normalized.includes("html")) {
    return SiHtml5;
  }

  if (normalized.includes("css")) {
    return SiCss;
  }

  if (normalized.includes("tailwind")) {
    return SiTailwindcss;
  }

  if (
    normalized.includes("node") ||
    normalized.includes("node js")
  ) {
    return SiNodedotjs;
  }

  if (normalized.includes("express")) {
    return SiExpress;
  }

  if (normalized.includes("firebase")) {
    return SiFirebase;
  }

  if (
    normalized.includes("mongodb") ||
    normalized.includes("mongo")
  ) {
    return SiMongodb;
  }

  if (normalized.includes("mysql")) {
    return SiMysql;
  }

  if (
    normalized.includes("postgres") ||
    normalized.includes("postgresql")
  ) {
    return SiPostgresql;
  }

  if (
    normalized.includes("tensorflow") ||
    normalized.includes("keras")
  ) {
    return SiTensorflow;
  }

  if (
    normalized.includes("pytorch") ||
    normalized.includes("torch")
  ) {
    return SiPytorch;
  }

  if (
    normalized.includes("openai") ||
    normalized.includes("chatgpt") ||
    normalized.includes("artificial intelligence") ||
    normalized === "ai" ||
    normalized === "ml" ||
    normalized.includes("machine learning") ||
    normalized.includes("llm")
  ) {
    return BrainCircuit;
  }

  if (
    normalized.includes("google cloud") ||
    normalized.includes("gcp")
  ) {
    return SiGooglecloud;
  }

  if (normalized.includes("docker")) {
    return SiDocker;
  }

  if (normalized.includes("figma")) {
    return SiFigma;
  }

  if (normalized.includes("streamlit")) {
    return SiStreamlit;
  }

  if (normalized.includes("fastapi")) {
    return SiFastapi;
  }

  if (normalized.includes("flask")) {
    return SiFlask;
  }

  if (normalized.includes("pandas")) {
    return SiPandas;
  }

  if (normalized.includes("numpy")) {
    return SiNumpy;
  }

  if (
    normalized.includes("scikit") ||
    normalized.includes("sklearn")
  ) {
    return SiScikitlearn;
  }

  /* Generic fallbacks */

  if (
    normalized.includes("database") ||
    normalized === "sql"
  ) {
    return Database;
  }

  if (
    normalized.includes("cloud") ||
    normalized.includes("aws") ||
    normalized.includes("azure")
  ) {
    return Cloud;
  }

  if (
    normalized.includes("api") ||
    normalized.includes("backend") ||
    normalized.includes("server")
  ) {
    return Server;
  }

  if (
    normalized.includes("web") ||
    normalized.includes("frontend")
  ) {
    return Globe;
  }

  if (
    normalized.includes("code") ||
    normalized.includes("programming")
  ) {
    return Code2;
  }

  return Layers3;
}

/* -------------------------------------------------------------------------- */
/* Technology icons                                                           */
/* -------------------------------------------------------------------------- */

function TechnologyIcons({
  technologies,
}: {
  technologies: string[];
}) {
  if (!technologies?.length) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`Technologies: ${technologies.join(
        ", "
      )}`}
    >
      {technologies.map((technology) => {
        const Icon = getTechnologyIcon(technology);

        return (
          <span
            key={technology}
            title={technology}
            aria-label={technology}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-[#0d0d0d] text-neutral-400 transition-all duration-300 group-hover:border-neutral-700 group-hover:text-white"
          >
            <Icon
              size={16}
              strokeWidth={1.7}
              className="shrink-0"
            />
          </span>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium fallback visual when a project has no image                       */
/* -------------------------------------------------------------------------- */

function NoImageVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#080808]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[18%] top-[24%] h-px w-[64%] bg-neutral-800" />
        <div className="absolute left-[30%] top-[42%] h-px w-[45%] bg-neutral-800" />
        <div className="absolute left-[14%] top-[64%] h-px w-[70%] bg-neutral-900" />

        <div className="absolute left-[28%] top-[20%] h-[60%] w-px bg-neutral-900" />
        <div className="absolute left-[50%] top-[12%] h-[76%] w-px bg-neutral-800" />
        <div className="absolute left-[72%] top-[20%] h-[60%] w-px bg-neutral-900" />
      </div>

      <div className="relative z-10 text-center">
        <Terminal
          size={30}
          strokeWidth={1}
          className="mx-auto mb-4 text-neutral-700"
        />

        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-700">
          Ashfaq Hyder
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublishedProjects();
        setProjects(data);
      } catch (err) {
        console.error(
          "Failed to load projects:",
          err
        );
        setError("Unable to load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <section
      id="projects"
      className="relative bg-[#050505] px-6 py-24 text-white md:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------------- */}
        {/* Section Header                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <ScrollReveal direction="left">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500 group">
                Selected Work
                <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 ml-2 group-hover:w-12 transition-all duration-300"></span>
              </p>

              <h2 className="max-w-3xl text-4xl font-medium tracking-tight md:text-6xl lg:text-7xl">
                Projects that turn
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  ideas into systems.
                </span>
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <p className="max-w-sm text-sm leading-6 text-neutral-500 md:text-right">
              A selection of work across development,
              artificial intelligence, machine learning,
              security, design and interactive experiences.
            </p>
          </ScrollReveal>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Loading                                                          */}
        {/* ---------------------------------------------------------------- */}

        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[420px] animate-pulse rounded-2xl border border-neutral-900 bg-neutral-950"
              />
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                            */}
        {/* ---------------------------------------------------------------- */}

        {!loading && error && (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-10">
            <p className="text-sm text-neutral-500">
              {error}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Empty                                                            */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          !error &&
          projects.length === 0 && (
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-10">
              <p className="text-sm text-neutral-500">
                No published projects yet.
              </p>
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* Projects                                                         */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          !error &&
          projects.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <ScrollReveal
                  key={
                    project.id ?? project.slug
                  }
                  direction={index % 2 === 0 ? "left" : "right"}
                  delay={index * 0.1}
                >
                  <HoverTilt intensity={0.02}>
                    <article
                      className={`group relative overflow-hidden rounded-2xl border border-neutral-900 bg-[#0a0a0a] transition-all duration-300 ${
                        index === 0
                          ? "md:col-span-2"
                          : ""
                      } hover:border-neutral-700 hover:shadow-lg hover:shadow-blue-500/10`}
                    >
                  {/* ------------------------------------------------------ */}
                  {/* Project Visual                                          */}
                  {/* ------------------------------------------------------ */}

                  <Link
                    href={`/projects/${project.slug}`}
                    className="block"
                    aria-label={`View ${project.title}`}
                  >
                    <div
                      className={`relative overflow-hidden bg-neutral-950 ${
                        index === 0
                          ? "aspect-[16/8]"
                          : "aspect-[16/10]"
                      }`}
                    >
                      {project.imageUrl ? (
                        <>
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            loading={
                              index === 0
                                ? "eager"
                                : "lazy"
                            }
                          />

                          <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:opacity-0" />
                        </>
                      ) : (
                        <NoImageVisual />
                      )}

                      {/* Project Number */}
                      <div className="absolute left-5 top-5">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-md">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>

                      {/* Featured */}
                      {project.featured && (
                        <div className="absolute right-5 top-5">
                          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-md">
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Hover Arrow */}
                      <div
                        className="absolute bottom-5 right-5 flex h-12 w-12 translate-y-3 items-center justify-center rounded-full border border-white/10 bg-black/40 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{
                          color:
                            "var(--portfolio-accent)",
                        }}
                      >
                        <ArrowUpRight
                          size={20}
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </Link>

                  {/* ------------------------------------------------------ */}
                  {/* Project Content                                          */}
                  {/* ------------------------------------------------------ */}

                  <div className="p-6 md:p-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                        {project.category}
                      </span>

                      <span className="text-[10px] text-neutral-700">
                        {String(
                          project.displayOrder
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Project Title */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-block"
                    >
                      <h3 className="text-2xl font-medium tracking-tight transition-colors duration-300 group-hover:text-[var(--portfolio-accent)] md:text-3xl">
                        {project.title}
                      </h3>
                    </Link>

                    {/* Project Description */}
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-500">
                      {project.description}
                    </p>

                    {/* ---------------------------------------------------- */}
                    {/* Technologies + Actions                               */}
                    {/* ---------------------------------------------------- */}

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                      {/* Technology Icons Only */}
                      <TechnologyIcons
                        technologies={
                          project.technologies ?? []
                        }
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        {/* View Project */}
                        <Link
                          href={`/projects/${project.slug}`}
                          className="rounded-full border border-neutral-800 px-5 py-2.5 text-xs uppercase tracking-wider text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                        >
                          View Project
                        </Link>

                        {/* GitHub — intentionally kept on card */}
                        {project.githubUrl && (
                          <a
                            href={
                              project.githubUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${project.title} on GitHub`}
                            className="flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-2.5 text-xs uppercase tracking-wider text-neutral-500 transition-all duration-300 hover:border-neutral-600 hover:text-white"
                          >
                            <SiGithub
                              size={14}
                              className="shrink-0"
                            />

                            <span>GitHub</span>

                            <ArrowUpRight
                              size={13}
                              strokeWidth={1.5}
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                    </article>
                  </HoverTilt>
                </ScrollReveal>
              ))}
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* Bottom Line                                                      */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          projects.length > 0 && (
            <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-neutral-900 pt-6 sm:flex-row sm:items-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                {projects.length}{" "}
                {projects.length === 1
                  ? "Project"
                  : "Projects"}
              </span>

              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                CODE × DESIGN × INTELLIGENCE
              </span>
            </div>
          )}
      </div>
    </section>
  );
}