"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";

import {
  AboutSettings,
  defaultAboutSettings,
  getAboutSettings,
} from "@/services/about";

/* =========================================================
   MOTION
========================================================= */

function clamp(
  value: number,
  min = 0,
  max = 1
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function smoothstep(value: number) {
  const t = clamp(value);

  return (
    t *
    t *
    (3 - 2 * t)
  );
}

function easeOutCubic(value: number) {
  const t = clamp(value);

  return (
    1 -
    Math.pow(1 - t, 3)
  );
}

function easeInOutCubic(value: number) {
  const t = clamp(value);

  return t < 0.5
    ? 4 * t * t * t
    : 1 -
        Math.pow(
          -2 * t + 2,
          3
        ) /
          2;
}

function range(
  value: number,
  start: number,
  end: number
) {
  return clamp(
    (value - start) /
      Math.max(
        end - start,
        0.0001
      )
  );
}

function lerp(
  start: number,
  end: number,
  progress: number
) {
  return (
    start +
    (end - start) *
      clamp(progress)
  );
}

/* =========================================================
   SEQUENTIAL LETTER REVEAL

   One continuous character timeline.
========================================================= */

function SequentialText({
  text,
  progress,
  className = "",
}: {
  text: string;
  progress: number;
  className?: string;
}) {
  const characters = useMemo(
    () => Array.from(text),
    [text]
  );

  const visibleCharacters =
    characters.filter(
      (character) =>
        character !== " " &&
        character !== "\n"
    ).length;

  let visibleIndex = 0;

  return (
    <span className={className}>
      {characters.map(
        (character, index) => {
          if (character === "\n") {
            return (
              <br
                key={`break-${index}`}
              />
            );
          }

          if (character === " ") {
            return (
              <span
                key={`space-${index}`}
                aria-hidden="true"
                style={{
                  display:
                    "inline-block",
                  width: "0.28em",
                }}
              >
                {" "}
              </span>
            );
          }

          const characterIndex =
            visibleIndex++;

          const start =
            characterIndex /
            Math.max(
              visibleCharacters,
              1
            );

          const end =
            (characterIndex + 1) /
            Math.max(
              visibleCharacters,
              1
            );

          const local =
            clamp(
              (progress - start) /
                Math.max(
                  end - start,
                  0.0001
                )
            );

          const eased =
            smoothstep(local);

          const resolved =
            clamp(
              (eased - 0.05) /
                0.65
            );

          return (
            <span
              key={`${index}-${character}`}
              style={{
                display:
                  "inline-block",

                color:
                  resolved < 1
                    ? "var(--portfolio-accent)"
                    : "var(--portfolio-text)",

                transform:
                  `translate3d(0, ${lerp(
                    8,
                    0,
                    eased
                  )}px, 0)`,

                filter:
                  `blur(${lerp(
                    2,
                    0,
                    eased
                  )}px)`,

                opacity:
                  lerp(
                    0.72,
                    1,
                    eased
                  ),

                willChange:
                  "transform, color, filter, opacity",

                transition:
                  "color 120ms linear, filter 160ms ease-out",

                whiteSpace:
                  "pre",
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

/* =========================================================
   SOCIAL ICONS
========================================================= */

function SocialIcon({
  type,
}: {
  type:
    | "github"
    | "linkedin"
    | "instagram"
    | "email";
}) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap:
      "round" as const,
    strokeLinejoin:
      "round" as const,
    "aria-hidden": true,
  };

  if (type === "github") {
    return (
      <svg {...common}>
        <path d="M15 22v-3.2c.04-.92-.27-1.7-.88-2.34 3.01-.34 6.17-1.48 6.17-6.67 0-1.48-.52-2.69-1.38-3.64.14-.34.6-1.73-.13-3.6 0 0-1.12-.36-3.68 1.39a12.7 12.7 0 0 0-6.7 0C5.84 2.19 4.72 2.55 4.72 2.55c-.73 1.87-.27 3.26-.13 3.6C3.73 7.1 3.21 8.31 3.21 9.79c0 5.17 3.15 6.34 6.15 6.68-.49.54-.82 1.31-.82 2.37V22" />
        <path d="M6 18c-.3 1.1-1.1 1.8-2.5 1.8" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg {...common}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
        <rect
          x="2"
          y="9"
          width="4"
          height="12"
        />
        <circle
          cx="4"
          cy="4"
          r="2"
        />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
        />
        <circle
          cx="17.5"
          cy="6.5"
          r="0.8"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

/* =========================================================
   SOCIAL BUTTON
========================================================= */

function SocialButton({
  href,
  type,
  label,
}: {
  href: string;
  type:
    | "github"
    | "linkedin"
    | "instagram"
    | "email";
  label: string;
}) {
  return (
    <a
      href={href}
      target={
        type === "email"
          ? undefined
          : "_blank"
      }
      rel={
        type === "email"
          ? undefined
          : "noreferrer"
      }
      aria-label={label}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500"
      style={{
        color:
          "var(--portfolio-muted)",

        border:
          "1px solid color-mix(in srgb, var(--portfolio-text) 12%, transparent)",

        background:
          "color-mix(in srgb, var(--portfolio-background) 50%, transparent)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color =
          "var(--portfolio-text)";

        event.currentTarget.style.borderColor =
          "var(--portfolio-accent)";

        event.currentTarget.style.transform =
          "translateY(-3px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color =
          "var(--portfolio-muted)";

        event.currentTarget.style.borderColor =
          "color-mix(in srgb, var(--portfolio-text) 12%, transparent)";

        event.currentTarget.style.transform =
          "translateY(0)";
      }}
    >
      <SocialIcon type={type} />

      <span
        className="pointer-events-none absolute bottom-[-24px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.15em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          color:
            "var(--portfolio-muted)",
        }}
      >
        {label}
      </span>
    </a>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function IntroductionAbout() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const [homepage, setHomepage] =
    useState<HomepageSettings>(
      defaultHomepageSettings
    );

  const [about, setAbout] =
    useState<AboutSettings>(
      defaultAboutSettings
    );

  const [
    scrollProgress,
    setScrollProgress,
  ] = useState(0);

  /* =======================================================
     CMS
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const [
          homepageData,
          aboutData,
        ] = await Promise.all([
          getHomepageSettings(),
          getAboutSettings(),
        ]);

        if (!active) return;

        setHomepage(
          homepageData
        );

        setAbout(
          aboutData
        );
      } catch (error) {
        console.error(
          "Introduction/About CMS loading failed:",
          error
        );
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     SMOOTH VISUAL SCROLL

     Native scrolling remains untouched.
  ======================================================= */

  useEffect(() => {
    let animationFrame = 0;

    let targetProgress = 0;
    let visualProgress = 0;

    let lastTime =
      performance.now();

    const getTargetProgress =
      () => {
        const section =
          sectionRef.current;

        if (!section) {
          return 0;
        }

        const rect =
          section.getBoundingClientRect();

        const distance =
          Math.max(
            section.offsetHeight -
              window.innerHeight,
            1
          );

        const travelled =
          -rect.top;

        return clamp(
          travelled / distance
        );
      };

    const updateTarget = () => {
      targetProgress =
        getTargetProgress();
    };

    const animate = (
      time: number
    ) => {
      const delta =
        Math.min(
          time - lastTime,
          32
        );

      lastTime = time;

      const difference =
        targetProgress -
        visualProgress;

      const smoothing =
        1 -
        Math.pow(
          0.0015,
          delta / 16.67
        );

      visualProgress +=
        difference *
        smoothing;

      if (
        Math.abs(
          targetProgress -
            visualProgress
        ) < 0.00012
      ) {
        visualProgress =
          targetProgress;
      }

      setScrollProgress(
        visualProgress
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    updateTarget();

    animationFrame =
      requestAnimationFrame(
        animate
      );

    window.addEventListener(
      "scroll",
      updateTarget,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateTarget
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "scroll",
        updateTarget
      );

      window.removeEventListener(
        "resize",
        updateTarget
      );
    };
  }, []);

  /* =======================================================
     CMS VALUES
  ======================================================= */

  const introLabel =
    homepage.introLabel ||
    "Introduction";

  const introTitle =
    homepage.introTitle ||
    "I create digital experiences that sit between";

  const introAccent =
    homepage.introAccent ||
    "technology and visual expression.";

  const introDescription =
    homepage.introDescription ||
    "I work across software, artificial intelligence, interaction and visual design to create digital experiences that are useful, expressive and memorable.";

  const aboutEyebrow =
    about.eyebrow ||
    "02 / About";

  const aboutTitle =
    about.title ||
    "Building at the intersection of technology and expression.";

  const aboutAccent =
    about.titleAccent ||
    "";

  const shortBio =
    about.shortBio ||
    "I build digital experiences across software, AI, interaction and visual design.";

  const biography =
    about.biography ||
    "My work explores how technology can become useful, expressive and memorable.";

  const location =
    about.location ||
    "Bengaluru, India";

  const availability =
    about.availability ||
    "Open to opportunities";

  /* =======================================================
     TEXT
  ======================================================= */

  const introFullText =
    `${introTitle} ${introAccent}`;

  const aboutFullText =
    aboutAccent
      ? `${aboutTitle} ${aboutAccent}`
      : aboutTitle;

  /* =======================================================
     GLOBAL TIMELINE

     Introduction remains unchanged.

     About receives a longer, more deliberate window.
  ======================================================= */

  const heroTransition =
    easeInOutCubic(
      range(
        scrollProgress,
        0,
        0.18
      )
    );

  const introEnter =
    easeOutCubic(
      range(
        scrollProgress,
        0.12,
        0.34
      )
    );

  const introLetters =
    easeInOutCubic(
      range(
        scrollProgress,
        0.34,
        0.67
      )
    );

  const introExit =
    easeInOutCubic(
      range(
        scrollProgress,
        0.72,
        0.82
      )
    );

  /*
   * ABOUT:
   *
   * 0.78 → 0.84
   * Scene arrives.
   *
   * 0.84 → 0.91
   * Main text resolves.
   *
   * 0.91 → 0.96
   * Supporting content arrives.
   *
   * 0.96 → 1.00
   * Final hold.
   */

  const aboutEnter =
    easeOutCubic(
      range(
        scrollProgress,
        0.78,
        0.87
      )
    );

  const aboutLetters =
    easeInOutCubic(
      range(
        scrollProgress,
        0.855,
        0.955
      )
    );

  const aboutDetails =
    easeOutCubic(
      range(
        scrollProgress,
        0.91,
        0.97
      )
    );

  const aboutSocials =
    easeOutCubic(
      range(
        scrollProgress,
        0.935,
        0.985
      )
    );

  /* =======================================================
     INTRO
  ======================================================= */

  const introY =
    lerp(
      100,
      0,
      introEnter
    );

  const introOpacity =
    introEnter *
    lerp(
      1,
      0,
      introExit
    );

  const introFinalY =
    introY +
    lerp(
      0,
      -48,
      introExit
    );

  const introScale =
    lerp(
      1,
      0.965,
      introExit
    );

  const introSupporting =
    easeOutCubic(
      range(
        scrollProgress,
        0.36,
        0.47
      )
    );

  /* =======================================================
     ABOUT SCENE
  ======================================================= */

  const aboutY =
    lerp(
      100,
      0,
      aboutEnter
    );

  const aboutOpacity =
    aboutEnter;

  const aboutScale =
    lerp(
      0.96,
      1,
      aboutEnter
    );

  /* =======================================================
     PORTRAIT

     The portrait intentionally enters slightly before
     the main text to create a spatial composition.
  ======================================================= */

  const portraitProgress =
    easeOutCubic(
      range(
        scrollProgress,
        0.79,
        0.90
      )
    );

  const portraitY =
    lerp(
      55,
      0,
      portraitProgress
    );

  const portraitX =
    lerp(
      -32,
      0,
      portraitProgress
    );

  const portraitScale =
    lerp(
      0.94,
      1,
      portraitProgress
    );

  const portraitOpacity =
    portraitProgress;

  /* =======================================================
     ABOUT COPY ENTRY
  ======================================================= */

  const aboutCopyProgress =
    easeOutCubic(
      range(
        scrollProgress,
        0.815,
        0.90
      )
    );

  const aboutCopyY =
    lerp(
      34,
      0,
      aboutCopyProgress
    );

  /* =======================================================
     ABOUT DETAILS
  ======================================================= */

  const detailsY =
    lerp(
      20,
      0,
      aboutDetails
    );

  /* =======================================================
     ATMOSPHERE
  ======================================================= */

  const transitionAtmosphere =
    lerp(
      0,
      0.035,
      heroTransition
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      ref={sectionRef}
      id="introduction"
      className="relative w-full"
      style={{
        height: "360svh",
        background:
          "var(--portfolio-background)",
      }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          background:
            "var(--portfolio-background)",
        }}
      >

        {/* =================================================
            ATMOSPHERE
        ================================================= */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute left-1/2 top-1/2 h-[52vw] w-[52vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
            style={{
              background:
                "var(--portfolio-accent)",

              opacity:
                transitionAtmosphere,
            }}
          />
        </div>

        {/* =================================================
            INTRODUCTION

            UNCHANGED VISUAL BEHAVIOUR
        ================================================= */}

        <div
          className="absolute inset-0 flex items-center"
          style={{
            opacity:
              introOpacity,

            transform:
              `translate3d(0, ${introFinalY}px, 0) scale(${introScale})`,

            transformOrigin:
              "center center",

            willChange:
              "transform, opacity",

            pointerEvents:
              introOpacity > 0.5
                ? "auto"
                : "none",
          }}
        >
          <div className="mx-auto w-full max-w-[1650px] px-6 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[1400px]">

              <div
                className="mb-7 flex items-center gap-3"
                style={{
                  opacity:
                    introSupporting,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      "var(--portfolio-accent)",
                  }}
                />

                <span
                  className="font-mono text-[9px] uppercase tracking-[0.24em]"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  {introLabel}
                </span>
              </div>

              <h2
                className="max-w-[1400px] font-[Syne,sans-serif] text-[clamp(2.8rem,7.2vw,8.5rem)] font-medium leading-[0.91] tracking-[-0.065em]"
                style={{
                  color:
                    "var(--portfolio-accent)",

                  textWrap:
                    "pretty",
                }}
              >
                <SequentialText
                  text={
                    introFullText
                  }
                  progress={
                    introLetters
                  }
                />
              </h2>

              <div
                className="mt-9 max-w-[650px]"
                style={{
                  opacity:
                    introSupporting,

                  transform:
                    `translate3d(0, ${lerp(
                      18,
                      0,
                      introSupporting
                    )}px, 0)`,

                  willChange:
                    "transform, opacity",
                }}
              >
                <p
                  className="font-[Manrope,sans-serif] text-[clamp(0.92rem,1.15vw,1.1rem)] leading-[1.8]"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  {
                    introDescription
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            REFINED ABOUT
        ================================================= */}

        <div
          id="about"
          className="absolute inset-0 flex items-center"
          style={{
            opacity:
              aboutOpacity,

            transform:
              `translate3d(0, ${aboutY}px, 0) scale(${aboutScale})`,

            transformOrigin:
              "center center",

            willChange:
              "transform, opacity",

            pointerEvents:
              aboutOpacity > 0.7
                ? "auto"
                : "none",
          }}
        >
          <div className="mx-auto w-full max-w-[1380px] px-6 sm:px-10 md:px-14 lg:px-20">

            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[300px_minmax(0,1fr)] md:gap-16 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-24">

              {/* =================================================
                  PORTRAIT
              ================================================= */}

              <div
                className="relative mx-auto w-full max-w-[300px] md:mx-0"
                style={{
                  opacity:
                    portraitOpacity,

                  transform:
                    `translate3d(${portraitX}px, ${portraitY}px, 0) scale(${portraitScale})`,

                  willChange:
                    "transform, opacity",
                }}
              >
                {about.profileImageUrl ? (
                  <div className="relative">

                    {/* offset architectural frame */}

                    <div
                      aria-hidden="true"
                      className="absolute -bottom-3 -left-3 h-full w-full"
                      style={{
                        border:
                          "1px solid color-mix(in srgb, var(--portfolio-accent) 25%, transparent)",

                        transform:
                          "translate(8px, 8px)",
                      }}
                    />

                    <div
                      className="relative overflow-hidden"
                      style={{
                        backgroundColor:
                          "var(--portfolio-surface)",
                      }}
                    >
                      <img
                        src={
                          about.profileImageUrl
                        }
                        alt="Profile portrait"
                        className="aspect-[4/5] w-full object-cover grayscale"
                        draggable={
                          false
                        }
                      />

                      {/* image gradient */}

                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                        style={{
                          background:
                            "linear-gradient(to top, color-mix(in srgb, var(--portfolio-background) 65%, transparent), transparent)",
                        }}
                      />

                      {/* image metadata */}

                      <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                        <div className="flex items-center justify-between">

                          <span
                            className="font-mono text-[8px] uppercase tracking-[0.2em]"
                            style={{
                              color:
                                "var(--portfolio-text)",
                            }}
                          >
                            Bengaluru / India
                          </span>

                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                "var(--portfolio-accent)",
                            }}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex aspect-[4/5] items-center justify-center"
                    style={{
                      backgroundColor:
                        "var(--portfolio-surface)",
                    }}
                  >
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.2em]"
                      style={{
                        color:
                          "var(--portfolio-muted)",
                      }}
                    >
                      Portrait unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  ABOUT CONTENT
              ================================================= */}

              <div
                className="min-w-0"
                style={{
                  transform:
                    `translate3d(0, ${aboutCopyY}px, 0)`,

                  opacity:
                    aboutCopyProgress,

                  willChange:
                    "transform, opacity",
                }}
              >

                {/* LABEL */}

                <div className="mb-7 flex items-center gap-3">

                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        "var(--portfolio-accent)",
                    }}
                  />

                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.24em]"
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    {
                      aboutEyebrow
                    }
                  </span>

                </div>

                {/* =================================================
                    MAIN ABOUT STATEMENT

                    SAME TYPOGRAPHY + LETTER BEHAVIOUR
                    AS INTRODUCTION
                ================================================= */}

                <h3
                  className="max-w-[980px] font-[Syne,sans-serif] text-[clamp(2.35rem,5vw,5.7rem)] font-medium leading-[0.94] tracking-[-0.06em]"
                  style={{
                    color:
                      "var(--portfolio-accent)",

                    textWrap:
                      "pretty",
                  }}
                >
                  <SequentialText
                    text={
                      aboutFullText
                    }
                    progress={
                      aboutLetters
                    }
                  />
                </h3>

                {/* =================================================
                    DESCRIPTION BLOCK

                    Arrives only after the main statement
                    has substantially resolved.
                ================================================= */}

                <div
                  className="mt-8 max-w-[680px]"
                  style={{
                    opacity:
                      aboutDetails,

                    transform:
                      `translate3d(0, ${detailsY}px, 0)`,

                    willChange:
                      "transform, opacity",
                  }}
                >
                  <p
                    className="font-[Manrope,sans-serif] text-[clamp(0.94rem,1.1vw,1.08rem)] leading-[1.75]"
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    {
                      shortBio
                    }
                  </p>

                  <p
                    className="mt-4 max-w-[610px] font-[Manrope,sans-serif] text-sm leading-7"
                    style={{
                      color:
                        "var(--portfolio-muted)",

                      opacity:
                        0.82,
                    }}
                  >
                    {
                      biography
                    }
                  </p>
                </div>

                {/* =================================================
                    META + SOCIAL
                ================================================= */}

                <div
                  className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
                  style={{
                    opacity:
                      aboutDetails,

                    transform:
                      `translate3d(0, ${detailsY}px, 0)`,
                  }}
                >

                  {/* META */}

                  <div className="flex flex-wrap gap-x-10 gap-y-4">

                    <div>
                      <span
                        className="block font-mono text-[7px] uppercase tracking-[0.2em]"
                        style={{
                          color:
                            "var(--portfolio-muted)",
                        }}
                      >
                        Location
                      </span>

                      <span
                        className="mt-1.5 block font-[Manrope,sans-serif] text-xs"
                        style={{
                          color:
                            "var(--portfolio-text)",
                        }}
                      >
                        {
                          location
                        }
                      </span>
                    </div>

                    <div>
                      <span
                        className="block font-mono text-[7px] uppercase tracking-[0.2em]"
                        style={{
                          color:
                            "var(--portfolio-muted)",
                        }}
                      >
                        Availability
                      </span>

                      <span
                        className="mt-1.5 block font-[Manrope,sans-serif] text-xs"
                        style={{
                          color:
                            "var(--portfolio-text)",
                        }}
                      >
                        {
                          availability
                        }
                      </span>
                    </div>

                  </div>

                  {/* SOCIAL */}

                  <div
                    className="flex items-center gap-2"
                    style={{
                      opacity:
                        aboutSocials,

                      transform:
                        `translate3d(0, ${lerp(
                          12,
                          0,
                          aboutSocials
                        )}px, 0)`,

                      willChange:
                        "transform, opacity",
                    }}
                  >
                    {about.email && (
                      <SocialButton
                        href={`mailto:${about.email}`}
                        type="email"
                        label="Email"
                      />
                    )}

                    {about.githubUrl && (
                      <SocialButton
                        href={
                          about.githubUrl
                        }
                        type="github"
                        label="GitHub"
                      />
                    )}

                    {about.linkedinUrl && (
                      <SocialButton
                        href={
                          about.linkedinUrl
                        }
                        type="linkedin"
                        label="LinkedIn"
                      />
                    )}

                    {about.instagramUrl && (
                      <SocialButton
                        href={
                          about.instagramUrl
                        }
                        type="instagram"
                        label="Instagram"
                      />
                    )}
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            PERSISTENT LOCATION BADGE
        ================================================= */}

        <div
          className="pointer-events-none fixed bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(18px,env(safe-area-inset-right))] z-[80]"
        >
          <div
            className="flex items-center gap-2 px-3 py-2 backdrop-blur-md"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--portfolio-background) 72%, transparent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  "var(--portfolio-accent)",
              }}
            />

            <span
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{
                color:
                  "var(--portfolio-text)",
              }}
            >
              Bengaluru / India
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}