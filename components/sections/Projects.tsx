"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
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
  SiGit,
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
  Project,
} from "@/services/projects";

const clamp = (
  value: number,
  min = 0,
  max = 1
) =>
  Math.min(
    Math.max(value, min),
    max
  );

const lerp = (
  start: number,
  end: number,
  amount: number
) =>
  start +
  (end - start) *
    clamp(amount);

const easeOutCubic = (
  value: number
) => {
  const t = clamp(value);
  return (
    1 -
    Math.pow(1 - t, 3)
  );
};

const smoothstep = (
  value: number
) => {
  const t = clamp(value);
  return (
    t *
    t *
    (3 - 2 * t)
  );
};

type IconComponent =
  React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

function getTechnologyIcon(
  technology: string
): IconComponent {
  const value = technology
    .toLowerCase()
    .trim()
    .replace(
      /[._-]/g,
      " "
    );

  if (value.includes("github"))
    return SiGithub;

  if (
    value === "git" ||
    value.includes("git scm")
  )
    return SiGit;

  if (
    value.includes("next js") ||
    value.includes("nextjs")
  )
    return SiNextdotjs;

  if (value.includes("react"))
    return SiReact;

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

  if (value === "python")
    return SiPython;

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

  if (value.includes("html"))
    return SiHtml5;

  if (value.includes("css"))
    return SiCss;

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

  if (value.includes("mysql"))
    return SiMysql;

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

function SequentialText({
  text,
  progress,
  className = "",
}: {
  text: string;
  progress: number;
  className?: string;
}) {
  const characters = Array.from(text);

  const meaningfulCharacters =
    characters.filter(
      (character) =>
        character !== " " &&
        character !== "\n"
    ).length;

  let characterIndex = 0;

  return (
    <span
      className={className}
      style={{
        display: "inline",
      }}
    >
      {characters.map(
        (
          character,
          index
        ) => {
          if (
            character === "\n"
          ) {
            return (
              <br
                key={`break-${index}`}
              />
            );
          }

          if (
            character === " "
          ) {
            return (
              <span
                key={`space-${index}`}
                aria-hidden="true"
                style={{
                  display:
                    "inline-block",
                  width:
                    "0.28em",
                }}
              >
                {" "}
              </span>
            );
          }

          const currentIndex =
            characterIndex++;

          const start =
            currentIndex /
            Math.max(
              meaningfulCharacters,
              1
            );

          const end =
            (currentIndex + 1) /
            Math.max(
              meaningfulCharacters,
              1
            );

          const letterProgress =
            clamp(
              (progress - start) /
                Math.max(
                  end - start,
                  0.0001
                )
            );

          const eased =
            smoothstep(
              letterProgress
            );

          return (
            <span
              key={`${character}-${index}`}
              style={{
                display:
                  "inline-block",
                color:
                  eased >= 0.98
                    ? "var(--portfolio-text)"
                    : "var(--portfolio-accent)",
                opacity: lerp(
                  0.3,
                  1,
                  eased
                ),
                transform: `
                  translate3d(
                    0,
                    ${lerp(
                      10,
                      0,
                      eased
                    )}px,
                    0
                  )
                `,
                filter: `blur(${lerp(
                  2,
                  0,
                  eased
                )}px)`,
                willChange:
                  "transform, opacity, color, filter",
              }}
            >
              {character}
            </span>
          );
        }
      )}
    </span>
  );
}

function SequentialParagraph({
  text,
  progress,
  exitProgress,
}: {
  text: string;
  progress: number;
  exitProgress: number;
}) {
  const characters = Array.from(text);

  const meaningfulCharacters =
    characters.filter(
      (character) =>
        character !== " " &&
        character !== "\n"
    ).length;

  let characterIndex = 0;

  return (
    <>
      {characters.map(
        (
          character,
          index
        ) => {
          if (
            character === "\n"
          ) {
            return (
              <br
                key={`break-${index}`}
              />
            );
          }

          if (
            character === " "
          ) {
            return (
              <span
                key={`space-${index}`}
                aria-hidden="true"
                style={{
                  display:
                    "inline-block",
                  width:
                    "0.27em",
                }}
              >
                {" "}
              </span>
            );
          }

          const currentIndex =
            characterIndex++;

          const start =
            currentIndex /
            Math.max(
              meaningfulCharacters,
              1
            );

          const end =
            (currentIndex + 1) /
            Math.max(
              meaningfulCharacters,
              1
            );

          const letterProgress =
            clamp(
              (progress - start) /
                Math.max(
                  end - start,
                  0.0001
                )
            );

          const eased =
            smoothstep(
              letterProgress
            );

          const finalOpacity =
            eased *
            (1 - exitProgress);

          const finalY =
            lerp(
              7,
              0,
              eased
            ) -
            lerp(
              0,
              8,
              exitProgress
            );

          return (
            <span
              key={`${character}-${index}`}
              style={{
                display:
                  "inline-block",
                color:
                  eased >= 0.98
                    ? "var(--portfolio-muted)"
                    : "var(--portfolio-accent)",
                opacity:
                  finalOpacity,
                transform: `
                  translate3d(
                    0,
                    ${finalY}px,
                    0
                  )
                `,
                filter: `blur(${lerp(
                  1.5,
                  0,
                  eased
                ) + lerp(
                  0,
                  1.5,
                  exitProgress
                )}px)`,
                willChange:
                  "transform, opacity, color, filter",
              }}
            >
              {character}
            </span>
          );
        }
      )}
    </>
  );
}

function ToolRail({
  technologies,
}: {
  technologies: string[];
}) {
  const [hovered, setHovered] =
    useState<string | null>(null);

  if (
    !technologies ||
    technologies.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        absolute
        bottom-0
        left-0
        right-0
        z-20
        flex
        items-center
        gap-2
        overflow-visible
        px-4
        py-3
        sm:px-5
      "
      style={{
        background:
          "color-mix(in srgb, var(--portfolio-background) 82%, transparent)",
        borderTop:
          "1px solid color-mix(in srgb, var(--portfolio-text) 12%, transparent)",
        backdropFilter:
          "blur(14px)",
      }}
      onMouseLeave={() =>
        setHovered(null)
      }
    >
      {technologies.map(
        (technology) => {
          const Icon =
            getTechnologyIcon(
              technology
            );

          const isHovered =
            hovered ===
            technology;

          return (
            <div
              key={technology}
              className="
                relative
                flex
                h-8
                min-w-8
                items-center
                justify-center
              "
              onMouseEnter={() =>
                setHovered(
                  technology
                )
              }
              onFocus={() =>
                setHovered(
                  technology
                )
              }
              onBlur={() =>
                setHovered(null)
              }
            >
              <button
                type="button"
                aria-label={
                  technology
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  outline-none
                  transition-all
                  duration-300
                "
                style={{
                  color:
                    isHovered
                      ? "var(--portfolio-accent)"
                      : "var(--portfolio-text)",
                  transform:
                    isHovered
                      ? "translateY(-2px)"
                      : "translateY(0)",
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={
                    1.5
                  }
                />
              </button>

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[calc(100%+10px)]
                  left-1/2
                  z-30
                  -translate-x-1/2
                  whitespace-nowrap
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  transition-all
                  duration-300
                "
                style={{
                  color:
                    "var(--portfolio-text)",
                  background:
                    "var(--portfolio-background)",
                  border:
                    "1px solid var(--portfolio-border)",
                  padding:
                    "7px 9px",
                  opacity:
                    isHovered
                      ? 1
                      : 0,
                  transform: `
                    translateX(-50%)
                    translateY(
                      ${isHovered ? 0 : 5}px
                    )
                  `,
                }}
              >
                {technology}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

function ProjectVisual({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="group relative block overflow-hidden">
      <div
        className="
          relative
          aspect-[16/10]
          w-full
          overflow-hidden
        "
        style={{
          background:
            "var(--portfolio-surface)",
          border:
            "1px solid var(--portfolio-border)",
        }}
      >
        {project.imageUrl ? (
          <img
            src={
              project.imageUrl
            }
            alt={
              project.title
            }
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-1000
              ease-out
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
            "
            style={{
              background:
                "var(--portfolio-surface)",
            }}
          >
            <Terminal
              size={34}
              strokeWidth={1}
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            />
          </div>
        )}

        <div
          className="
            absolute
            inset-0
            transition-opacity
            duration-700
            group-hover:opacity-0
          "
          style={{
            background:
              "color-mix(in srgb, var(--portfolio-background) 12%, transparent)",
          }}
        />

        <div
          className="
            absolute
            left-5
            top-5
            z-10
            font-mono
            text-[8px]
            uppercase
            tracking-[0.18em]
          "
          style={{
            color:
              "var(--portfolio-text)",
            background:
              "color-mix(in srgb, var(--portfolio-background) 72%, transparent)",
            border:
              "1px solid var(--portfolio-border)",
            padding:
              "7px 10px",
            backdropFilter:
              "blur(10px)",
          }}
        >
          {project.category}
        </div>

        {project.featured && (
          <div
            className="
              absolute
              right-5
              top-5
              z-10
              font-mono
              text-[8px]
              uppercase
              tracking-[0.18em]
            "
            style={{
              color:
                "var(--portfolio-accent)",
              background:
                "color-mix(in srgb, var(--portfolio-background) 72%, transparent)",
              border:
                "1px solid var(--portfolio-border)",
              padding:
                "7px 10px",
              backdropFilter:
                "blur(10px)",
            }}
          >
            Featured
          </div>
        )}

        <ToolRail
          technologies={
            project.technologies ??
            []
          }
        />
      </div>
    </div>
  );
}

export default function Projects() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [scrollProgress, setScrollProgress] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const data =
          await getPublishedProjects();

        if (!mounted) return;

        const featured =
          data
            .filter(
              (project) =>
                project.published ===
                  true &&
                project.featured ===
                  true
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            );

        setProjects(
          featured
        );
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let target = 0;
    let current = 0;
    let previous =
      performance.now();

    const readScroll = () => {
      const section =
        sectionRef.current;

      if (!section) return;

      const rect =
        section.getBoundingClientRect();

      const scrollable =
        Math.max(
          section.offsetHeight -
            window.innerHeight,
          1
        );

      target = clamp(
        -rect.top /
          scrollable
      );
    };

    const animate = (
      time: number
    ) => {
      const delta = Math.min(
        time - previous,
        32
      );

      previous = time;

      const smoothing =
        1 -
        Math.pow(
          0.001,
          delta / 16.67
        );

      current +=
        (target - current) *
        smoothing;

      if (
        Math.abs(
          target - current
        ) < 0.00005
      ) {
        current = target;
      }

      setScrollProgress(
        current
      );

      frame =
        requestAnimationFrame(
          animate
        );
    };

    readScroll();

    frame =
      requestAnimationFrame(
        animate
      );

    window.addEventListener(
      "scroll",
      readScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      readScroll
    );

    return () => {
      cancelAnimationFrame(
        frame
      );

      window.removeEventListener(
        "scroll",
        readScroll
      );

      window.removeEventListener(
        "resize",
        readScroll
      );
    };
  }, []);

  if (loading) {
    return (
      <section
        id="projects"
        className="w-full"
        style={{
          minHeight:
            "100svh",
          background:
            "var(--portfolio-background)",
        }}
      />
    );
  }

  if (!projects.length) {
    return null;
  }

  const totalStages =
    projects.length + 2;

  const stagePosition =
    scrollProgress *
    totalStages;

  const activeStage =
    Math.min(
      totalStages - 1,
      Math.floor(
        stagePosition
      )
    );

  const stageProgress =
    stagePosition -
    activeStage;

  const isHeadingStage =
    activeStage === 0;

  const isViewAllStage =
    activeStage ===
    totalStages - 1;

  const projectIndex =
    activeStage > 0 &&
    !isViewAllStage
      ? activeStage - 1
      : -1;

  const project =
    projectIndex >= 0
      ? projects[
          projectIndex
        ]
      : null;

  const ENTER_END = 0.22;
  const EXIT_START = 0.70;

  const enterProgress =
    easeOutCubic(
      clamp(
        stageProgress /
          ENTER_END
      )
    );

  const exitProgress =
    easeOutCubic(
      clamp(
        (stageProgress -
          EXIT_START) /
          (1 - EXIT_START)
      )
    );

  const contentEnter =
    easeOutCubic(
      clamp(
        (stageProgress -
          0.04) /
          0.28
      )
    );

  const descriptionEnter =
    easeOutCubic(
      clamp(
        (stageProgress -
          0.18) /
          0.30
      )
    );

  const metadataEnter =
    easeOutCubic(
      clamp(
        (stageProgress -
          0.35) /
          0.25
      )
    );

  const headingProgress =
    isHeadingStage
      ? easeOutCubic(
          clamp(
            stageProgress /
              0.8
          )
        )
      : 1;

  const alternate =
    projectIndex % 2 === 1;

  const projectOpacity =
    isHeadingStage ||
    isViewAllStage
      ? 0
      : 1 - exitProgress;

  const projectTranslateY =
    lerp(
      55,
      0,
      enterProgress
    ) -
    lerp(
      0,
      45,
      exitProgress
    );

  const projectScale =
    lerp(
      0.975,
      1,
      enterProgress
    ) -
    lerp(
      0,
      0.018,
      exitProgress
    );

  const projectBlur =
    lerp(
      5,
      0,
      enterProgress
    ) +
    lerp(
      0,
      4,
      exitProgress
    );

  const categoryOpacity =
    contentEnter *
    (1 - exitProgress);

  const categoryY =
    lerp(
      18,
      0,
      contentEnter
    ) -
    lerp(
      0,
      18,
      exitProgress
    );

  const titleOpacity =
    contentEnter *
    (1 - exitProgress);

  const titleY =
    lerp(
      28,
      0,
      contentEnter
    ) -
    lerp(
      0,
      28,
      exitProgress
    );

  const descriptionOpacity =
    descriptionEnter *
    (1 - exitProgress);

  const descriptionY =
    lerp(
      22,
      0,
      descriptionEnter
    ) -
    lerp(
      0,
      22,
      exitProgress
    );

  const metadataOpacity =
    metadataEnter *
    (1 - exitProgress);

  const metadataY =
    lerp(
      18,
      0,
      metadataEnter
    ) -
    lerp(
      0,
      18,
      exitProgress
    );

  const visualEnter =
    easeOutCubic(
      clamp(
        (stageProgress -
          0.02) /
          0.30
      )
    );

  const visualExit =
    easeOutCubic(
      clamp(
        (stageProgress -
          0.68) /
          0.32
      )
    );

  const visualOpacity =
    visualEnter *
    (1 - visualExit);

  const visualX =
    lerp(
      alternate
        ? -55
        : 55,
      0,
      visualEnter
    ) +
    lerp(
      0,
      alternate
        ? 35
        : -35,
      visualExit
    );

  const visualY =
    lerp(
      24,
      0,
      visualEnter
    ) -
    lerp(
      0,
      20,
      visualExit
    );

  const visualScale =
    lerp(
      0.965,
      1,
      visualEnter
    ) -
    lerp(
      0,
      0.015,
      visualExit
    );

  const visualBlur =
    lerp(
      3,
      0,
      visualEnter
    ) +
    lerp(
      0,
      3,
      visualExit
    );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full"
      style={{
        height: `${
          totalStages * 100
        }svh`,
        background:
          "var(--portfolio-background)",
        color:
          "var(--portfolio-text)",
      }}
    >
      <div
        className="
          sticky
          top-0
          h-[100svh]
          overflow-hidden
        "
      >
        <div
          className="
            relative
            mx-auto
            flex
            h-full
            w-full
            max-w-[1600px]
            flex-col
            px-6
            py-8
            sm:px-10
            md:px-14
            md:py-12
            lg:px-20
          "
        >
          <header
            className="
              relative
              z-30
              shrink-0
              pt-[4vh]
            "
          >
            <p
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.24em]
              "
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              / SELECTED WORK
            </p>

            <h2
              className="
                mt-4
                max-w-[900px]
                font-[Syne,sans-serif]
                text-[clamp(2.5rem,5vw,5.5rem)]
                font-medium
                leading-[0.88]
                tracking-[-0.07em]
              "
            >
              <SequentialText
                text="Projects "
                progress={
                  headingProgress
                }
              />
            </h2>
          </header>

          <div
            className="
              relative
              mt-[5vh]
              min-h-0
              flex-1
              overflow-hidden
            "
          >
            {project && (
              <article
                key={
                  project.id ??
                  project.slug
                }
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                "
                style={{
                  opacity:
                    projectOpacity,
                  transform: `
                    translate3d(
                      0,
                      ${projectTranslateY}px,
                      0
                    )
                    scale(${projectScale})
                  `,
                  filter: `blur(${projectBlur}px)`,
                  pointerEvents:
                    exitProgress >
                    0.5
                      ? "none"
                      : "auto",
                  willChange:
                    "transform, opacity, filter",
                }}
              >
                <div
                  className="
                    grid
                    w-full
                    items-center
                    gap-10
                    lg:grid-cols-2
                    lg:gap-16
                  "
                >
                  <div
                    className={`
                      min-w-0
                      ${
                        alternate
                          ? "lg:order-2"
                          : "lg:order-1"
                      }
                    `}
                  >
                    <div
                      style={{
                        opacity:
                          categoryOpacity,
                        transform: `
                          translate3d(
                            0,
                            ${categoryY}px,
                            0
                          )
                        `,
                      }}
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >
                        <span
                          className="
                            font-mono
                            text-[10px]
                            uppercase
                            tracking-[0.2em]
                          "
                          style={{
                            color:
                              "var(--portfolio-accent)",
                          }}
                        >
                          {String(
                            projectIndex +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span
                          className="h-px w-8"
                          style={{
                            background:
                              "var(--portfolio-border)",
                          }}
                        />

                        <span
                          className="
                            font-mono
                            text-[9px]
                            uppercase
                            tracking-[0.18em]
                          "
                          style={{
                            color:
                              "var(--portfolio-muted)",
                          }}
                        >
                          {
                            project.category
                          }
                        </span>
                      </div>
                    </div>

                    <h3
                      className="
                        mt-5
                        max-w-[650px]
                        font-[Syne,sans-serif]
                        text-[clamp(2.2rem,4.2vw,4.8rem)]
                        font-medium
                        leading-[0.9]
                        tracking-[-0.065em]
                      "
                      style={{
                        opacity:
                          titleOpacity,
                        transform: `
                          translate3d(
                            0,
                            ${titleY}px,
                            0
                          )
                        `,
                      }}
                    >
                      <SequentialText
                        text={
                          project.title
                        }
                        progress={
                          contentEnter
                        }
                      />
                    </h3>

                    <div
                      className="
                        mt-7
                        max-w-[650px]
                      "
                      style={{
                        opacity:
                          descriptionOpacity,
                        transform: `
                          translate3d(
                            0,
                            ${descriptionY}px,
                            0
                          )
                        `,
                      }}
                    >
                      <p
                        className="
                          font-[Manrope,sans-serif]
                          text-[clamp(.9rem,1.05vw,1.05rem)]
                          leading-[1.8]
                        "
                      >
                        <SequentialParagraph
                          text={
                            project.description
                          }
                          progress={
                            descriptionEnter
                          }
                          exitProgress={
                            exitProgress
                          }
                        />
                      </p>
                    </div>

                    <div
                      className="
                        mt-8
                        flex
                        flex-wrap
                        gap-3
                      "
                      style={{
                        opacity:
                          metadataOpacity,
                        transform: `
                          translate3d(
                            0,
                            ${metadataY}px,
                            0
                          )
                        `,
                      }}
                    >

                      {project.githubUrl && (
                        <a
                          href={
                            project.githubUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            group
                            inline-flex
                            items-center
                            gap-3
                            border
                            px-5
                            py-3
                            font-mono
                            text-[9px]
                            uppercase
                            tracking-[0.16em]
                            transition-all
                            duration-300
                          "
                          style={{
                            borderColor:
                              "var(--portfolio-border)",
                            color:
                              "var(--portfolio-muted)",
                          }}
                        >
                          <SiGithub
                            size={14}
                          />

                          GitHub

                          <ArrowUpRight
                            size={13}
                            strokeWidth={
                              1.5
                            }
                            className="
                              transition-transform
                              duration-300
                              group-hover:-translate-y-0.5
                              group-hover:translate-x-0.5
                            "
                          />
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    className={`
                      min-w-0
                      ${
                        alternate
                          ? "lg:order-1"
                          : "lg:order-2"
                      }
                    `}
                    style={{
                      opacity:
                        visualOpacity,
                      transform: `
                        translate3d(
                          ${visualX}px,
                          ${visualY}px,
                          0
                        )
                        scale(${visualScale})
                      `,
                      filter: `blur(${visualBlur}px)`,
                      willChange:
                        "transform, opacity, filter",
                    }}
                  >
                    <ProjectVisual
                      project={project}
                    />
                  </div>
                </div>
              </article>
            )}

            {isViewAllStage && (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
                style={{
                  opacity:
                    easeOutCubic(
                      clamp(
                        stageProgress /
                          0.45
                      )
                    ),
                  transform: `
                    translate3d(
                      0,
                      ${lerp(
                        35,
                        0,
                        easeOutCubic(
                          clamp(
                            stageProgress /
                              0.45
                          )
                        )
                      )}px,
                      0
                    )
                  `,
                }}
              >
                <div className="text-center">
                  <p
                    className="
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-[0.25em]
                    "
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    THE COMPLETE ARCHIVE
                  </p>

                  <h3
                    className="
                      mt-5
                      font-[Syne,sans-serif]
                      text-[clamp(2.4rem,5vw,5rem)]
                      font-medium
                      leading-[0.9]
                      tracking-[-0.065em]
                    "
                  >
                    All the work.
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-5
                      max-w-md
                      text-sm
                      leading-7
                    "
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    Explore every
                    published project,
                    including work
                    outside the featured
                    selection.
                  </p>

                  <Link
                    href="/projects"
                    className="
                      group
                      mt-8
                      inline-flex
                      items-center
                      gap-4
                      border
                      px-7
                      py-4
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-[0.18em]
                      transition-all
                      duration-300
                    "
                    style={{
                      borderColor:
                        "var(--portfolio-text)",
                      color:
                        "var(--portfolio-text)",
                    }}
                  >
                    View All Projects

                    <ArrowUpRight
                      size={15}
                      strokeWidth={
                        1.5
                      }
                      className="
                        transition-transform
                        duration-300
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                      style={{
                        color:
                          "var(--portfolio-accent)",
                      }}
                    />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div
            className="
              absolute
              bottom-8
              left-6
              right-6
              z-40
              flex
              items-center
              justify-between
              sm:left-10
              sm:right-10
              md:left-14
              md:right-14
              lg:left-20
              lg:right-20
            "
          >
            <div
              className="
                hidden
                h-px
                w-24
                overflow-hidden
                sm:block
              "
              style={{
                background:
                  "var(--portfolio-border)",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${
                    ((activeStage +
                      1) /
                      totalStages) *
                    100
                  }%`,
                  background:
                    "var(--portfolio-accent)",
                }}
              />
            </div>

            <div
              className="
                ml-auto
                font-mono
                text-[8px]
                uppercase
                tracking-[0.18em]
              "
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              {isViewAllStage
                ? "ALL"
                : activeStage ===
                    0
                  ? "00"
                  : String(
                      projectIndex +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}

              {" / "}

              {String(
                projects.length
              ).padStart(
                2,
                "0"
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}