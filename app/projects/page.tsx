"use client";
import PortfolioCursor from "@/components/PortfolioCursor";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Terminal,
} from "lucide-react";
import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFigma,
  SiFirebase,
  SiFlask,
  SiGithub,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";
import {
  getPublishedProjects,
  type Project,
} from "@/services/projects";

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

type TechnologyIcon =
  React.ComponentType<IconProps>;

function getTechnologyIcon(
  technology: string
): TechnologyIcon {
  const value = technology
    .toLowerCase()
    .trim()
    .replace(/[._-]/g, " ");

  if (value.includes("github")) return SiGithub;
  if (value === "git") return SiGithub;
  if (
    value.includes("next js") ||
    value.includes("nextjs")
  )
    return SiNextdotjs;
  if (value.includes("react")) return SiReact;
  if (
    value === "typescript" ||
    value === "ts"
  )
    return SiTypescript;
  if (
    value === "javascript" ||
    value === "js"
  )
    return SiJavascript;
  if (value === "python") return SiPython;
  if (
    value === "c++" ||
    value.includes("cplusplus")
  )
    return SiCplusplus;
  if (
    value === "c" ||
    value === "c language"
  )
    return SiC;
  if (value.includes("html")) return SiHtml5;
  if (value.includes("css")) return SiCss;
  if (value.includes("tailwind"))
    return SiTailwindcss;
  if (value.includes("node"))
    return SiNodedotjs;
  if (value.includes("express"))
    return SiExpress;
  if (value.includes("firebase"))
    return SiFirebase;
  if (value.includes("mongodb"))
    return SiMongodb;
  if (value.includes("mysql")) return SiMysql;
  if (value.includes("postgres"))
    return SiPostgresql;
  if (value.includes("tensorflow"))
    return SiTensorflow;
  if (value.includes("pytorch"))
    return SiPytorch;
  if (value.includes("google cloud"))
    return SiGooglecloud;
  if (value.includes("docker"))
    return SiDocker;
  if (value.includes("figma"))
    return SiFigma;
  if (value.includes("streamlit"))
    return SiStreamlit;
  if (value.includes("fastapi"))
    return SiFastapi;
  if (value.includes("flask"))
    return SiFlask;
  if (value.includes("pandas"))
    return SiPandas;
  if (value.includes("numpy"))
    return SiNumpy;
  if (value.includes("scikit"))
    return SiScikitlearn;

  return Terminal;
}

function ToolIcons({
  technologies,
}: {
  technologies: string[];
}) {
  const [active, setActive] =
    useState<string | null>(null);

  if (!technologies?.length) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1.5"
      onMouseLeave={() =>
        setActive(null)
      }
    >
      {technologies.map(
        (technology) => {
          const Icon =
            getTechnologyIcon(
              technology
            );

          const isActive =
            active === technology;

          return (
            <div
              key={technology}
              className="relative"
              onMouseEnter={() =>
                setActive(
                  technology
                )
              }
            >
              <div
                className="flex h-8 w-8 items-center justify-center transition-all duration-300"
                style={{
                  color: isActive
                    ? "var(--portfolio-accent)"
                    : "var(--portfolio-muted)",
                  transform: isActive
                    ? "translateY(-2px)"
                    : "translateY(0)",
                }}
              >
                <Icon size={15} />
              </div>

              <span
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-[120] -translate-x-1/2 whitespace-nowrap border px-2 py-1.5 font-mono text-[7px] uppercase tracking-[0.14em] transition-all duration-200"
                style={{
                  opacity: isActive
                    ? 1
                    : 0,
                  transform: `
                    translateX(-50%)
                    translateY(
                      ${isActive ? 0 : 4}px
                    )
                  `,
                  color:
                    "var(--portfolio-text)",
                  background:
                    "var(--portfolio-background)",
                  borderColor:
                    "var(--portfolio-border)",
                }}
              >
                {technology}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [hovered, setHovered] =
    useState(false);

  const [mousePosition, setMousePosition] =
    useState({
      x: 0,
      y: 0,
    });

  function handleMouseMove(
    event: React.MouseEvent<HTMLElement>
  ) {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <article
      className="group relative border-t"
      style={{
        borderColor:
          "var(--portfolio-border)",
      }}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() =>
        setHovered(false)
      }
      onMouseMove={handleMouseMove}
    >
      <div className="relative flex min-h-[115px] items-center gap-5 py-7 md:min-h-[125px] md:gap-8 md:py-8">
        <span
          className="w-8 shrink-0 font-mono text-[9px] tracking-[0.18em] transition-colors duration-300"
          style={{
            color: hovered
              ? "var(--portfolio-accent)"
              : "var(--portfolio-muted)",
          }}
        >
          {String(
            index + 1
          ).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <h2
              className="font-[Syne,sans-serif] text-[clamp(1.7rem,3.4vw,3.8rem)] font-medium leading-[0.9] tracking-[-0.06em] transition-all duration-500"
              style={{
                color:
                  "var(--portfolio-text)",
                transform: hovered
                  ? "translateX(5px)"
                  : "translateX(0)",
              }}
            >
              {project.title}
            </h2>

            <div className="shrink-0">
              <ToolIcons
                technologies={
                  project.technologies
                }
              />
            </div>
          </div>

          <div
            className="mt-3 flex items-center gap-3 font-mono text-[7px] uppercase tracking-[0.18em] transition-all duration-300"
            style={{
              color:
                "var(--portfolio-muted)",
            }}
          >
            <span>
              {project.category}
            </span>

            {project.featured && (
              <>
                <span
                  className="h-px w-5"
                  style={{
                    background:
                      "var(--portfolio-border)",
                  }}
                />

                <span
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
        </div>

        <ArrowUpRight
          size={17}
          strokeWidth={1.4}
          className="hidden shrink-0 transition-all duration-500 md:block"
          style={{
            color: hovered
              ? "var(--portfolio-accent)"
              : "var(--portfolio-muted)",
            transform: hovered
              ? "translate(2px,-2px)"
              : "translate(0,0)",
          }}
        />
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{
          gridTemplateRows: hovered
            ? "1fr"
            : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div
            className="flex flex-col gap-6 pb-8 pt-1 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered
                ? "translateY(0)"
                : "translateY(-14px)",
              transition:
                "opacity 450ms ease 80ms, transform 650ms cubic-bezier(.22,1,.36,1)",
            }}
          >
            <p
              className="max-w-2xl text-sm leading-7 md:text-[15px] md:leading-8"
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              {project.description}
            </p>

            {project.githubUrl && (
              <a
                href={
                  project.githubUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group/github inline-flex w-fit shrink-0 items-center gap-3 border px-4 py-3 font-mono text-[8px] uppercase tracking-[0.17em] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  color:
                    "var(--portfolio-text)",
                  borderColor:
                    "var(--portfolio-border)",
                }}
              >
                <SiGithub size={14} />

                <span>
                  View on GitHub
                </span>

                <ExternalLink
                  size={12}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover/github:-translate-y-0.5 group-hover/github:translate-x-0.5"
                  style={{
                    color:
                      "var(--portfolio-accent)",
                  }}
                />
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden w-[min(34vw,460px)] md:block"
        style={{
          left:
            mousePosition.x + 24,
          top:
            mousePosition.y + 24,
          opacity: hovered ? 1 : 0,
          transform: hovered
            ? "scale(1) translateY(0)"
            : "scale(.94) translateY(8px)",
          transition:
            "opacity 300ms ease, transform 400ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "16 / 10",
            border:
              "1px solid var(--portfolio-border)",
            background:
              "var(--portfolio-surface)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,.18)",
          }}
        >
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Terminal
                size={30}
                strokeWidth={1}
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--portfolio-background) 35%, transparent), transparent 65%)",
            }}
          />

          <div
            className="absolute bottom-4 left-4 font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{
              color:
                "var(--portfolio-text)",
              background:
                "color-mix(in srgb, var(--portfolio-background) 78%, transparent)",
              border:
                "1px solid var(--portfolio-border)",
              padding:
                "7px 9px",
              backdropFilter:
                "blur(10px)",
            }}
          >
            {project.category}
          </div>
        </div>
      </div>
    </article>
  );
}

function BackToPortfolio({
  className = "",
}: {
  className?: string;
}) {
  function handleBack(
    event: React.MouseEvent<HTMLAnchorElement>
  ) {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    const cameFromPortfolio =
      sessionStorage.getItem(
        "came-from-portfolio"
      );

    if (cameFromPortfolio === "true") {
      sessionStorage.removeItem(
        "came-from-portfolio"
      );

      sessionStorage.setItem(
        "returning-from-projects",
        "true"
      );

      window.history.back();

      return;
    }

    window.location.href =
      "/#projects-view-all";
  }

  return (
    <a
      href="/#projects-view-all"
      onClick={handleBack}
      className={`group inline-flex items-center gap-3 border px-4 py-3 font-mono text-[8px] uppercase tracking-[0.18em] transition-all duration-300 ${className}`}
      style={{
        color:
          "var(--portfolio-muted)",
        borderColor:
          "var(--portfolio-border)",
      }}
    >
      <ArrowLeft
        size={13}
        strokeWidth={1.5}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />

      Back to portfolio
    </a>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const timer =
      window.setTimeout(() => {
        if (mounted) {
          setVisible(true);
        }
      }, 80);

    async function loadProjects() {
      try {
        const data =
          await getPublishedProjects();

        if (!mounted) return;

        setProjects(
          [...data].sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          )
        );
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "var(--portfolio-background)",
        color:
          "var(--portfolio-text)",
      }}
    ><PortfolioCursor />
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 md:px-14 lg:px-20">
        <header
          className="pt-[10vh] md:pt-[14vh]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0)"
              : "translateY(25px)",
            transition:
              "opacity 900ms ease, transform 1000ms cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div className="flex items-start justify-between gap-8">
            <div>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              >
                PROJECT ARCHIVE
              </p>

              <h1
                className="mt-5 font-[Syne,sans-serif] text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.82] tracking-[-0.08em]"
                style={{
                  color:
                    "var(--portfolio-text)",
                }}
              >
                All the work.
              </h1>
            </div>

            <BackToPortfolio className="hidden sm:inline-flex" />
          </div>

          <div
            className="mt-9 flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-end sm:justify-between"
            style={{
              borderColor:
                "var(--portfolio-border)",
            }}
          >
            <p
              className="max-w-xl text-sm leading-7"
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              A complete collection of
              projects, experiments,
              systems, and ideas.
              Hover a project to
              explore it.
            </p>

            {!loading &&
              !error && (
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.2em]"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  {projects.length}{" "}
                  {projects.length === 1
                    ? "PROJECT"
                    : "PROJECTS"}
                </span>
              )}
          </div>
        </header>

        <section className="pb-[12vh] pt-[5vh]">
          {loading && (
            <div className="py-[15vh]">
              <div
                className="h-px w-24 animate-pulse"
                style={{
                  background:
                    "var(--portfolio-accent)",
                }}
              />
            </div>
          )}

          {error && !loading && (
            <div className="py-[15vh]">
              <p
                className="font-mono text-[9px] uppercase tracking-[0.2em]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              >
                Unable to load projects.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="py-[15vh]">
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  No published projects.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            projects.map(
              (project, index) => (
                <ProjectRow
                  key={
                    project.id ??
                    project.slug
                  }
                  project={project}
                  index={index}
                />
              )
            )}
        </section>

        <footer
          className="border-t py-8"
          style={{
            borderColor:
              "var(--portfolio-border)",
          }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <span
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              End of archive
            </span>

            <BackToPortfolio />
          </div>
        </footer>

      </div>
    </main>
  );
}