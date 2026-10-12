
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
} from "lucide-react";

import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";

const clamp = (value: number) =>
  Math.min(Math.max(value, 0), 1);

const easeOut = (value: number) => {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
};

const easeInOut = (value: number) => {
  const t = clamp(value);

  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const range = (
  value: number,
  start: number,
  end: number
) => {
  if (end === start) return 0;

  return clamp(
    (value - start) / (end - start)
  );
};

/* =========================================================
   CHARACTER REVEAL
   ========================================================= */

function RevealLine({
  text,
  progress,
  accent = false,
}: {
  text: string;
  progress: number;
  accent?: boolean;
}) {
  if (!text) return null;

  return (
    <span className="block">
      {Array.from(text).map(
        (character, index) => {
          const length = Math.max(
            text.length,
            1
          );

          const start = index / length;
          const end = (index + 1) / length;

          const local = clamp(
            (progress - start) /
              Math.max(end - start, 0.001)
          );

          const reveal = easeOut(local);

          return (
            <span
              key={`${character}-${index}`}
              className="inline-block"
              style={{
                color: accent
                  ? "var(--portfolio-accent)"
                  : "var(--portfolio-text)",

                opacity:
                  0.05 + reveal * 0.95,

                transform: `translate3d(0,${
                  (1 - reveal) * 16
                }px,0)`,

                filter: `blur(${
                  (1 - reveal) * 1.8
                }px)`,

                transition:
                  "color 600ms cubic-bezier(.16,1,.3,1)",
              }}
            >
              {character === " "
                ? "\u00A0"
                : character}
            </span>
          );
        }
      )}
    </span>
  );
}

/* =========================================================
   CONTACT
   ========================================================= */

export default function Contact() {
  const [settings, setSettings] =
    useState<HomepageSettings>(
      defaultHomepageSettings
    );

  const [scrollProgress, setScrollProgress] =
    useState(0);

  const [emailHover, setEmailHover] =
    useState(false);

  const [emailCopied, setEmailCopied] =
    useState(false);

  const sectionRef =
    useRef<HTMLElement | null>(null);

  const emailRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     LOAD HOMEPAGE CMS
     ======================================================= */

  useEffect(() => {
    async function loadHomepage() {
      try {
        const data =
          await getHomepageSettings();

        setSettings(data);
      } catch (error) {
        console.error(
          "Failed to load homepage settings:",
          error
        );
      }
    }

    loadHomepage();
  }, []);

  /* =======================================================
     SCROLL PROGRESS
     ======================================================= */

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const section =
        sectionRef.current;

      if (!section) {
        frame = 0;
        return;
      }

      const rect =
        section.getBoundingClientRect();

      const distance = Math.max(
        section.offsetHeight -
          window.innerHeight,
        1
      );

      const progress = clamp(
        -rect.top / distance
      );

      setScrollProgress(progress);

      frame = 0;
    };

    const handleScroll = () => {
      if (frame) return;

      frame =
        requestAnimationFrame(update);
    };

    update();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  /* =======================================================
     MAGNETIC CTA
     ======================================================= */

  useEffect(() => {
    const handlePointerMove = (
      event: PointerEvent
    ) => {
      const element =
        emailRef.current;

      if (!element || !emailHover) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      const x =
        ((event.clientX - rect.left) /
          rect.width -
          0.5) *
        10;

      const y =
        ((event.clientY - rect.top) /
          rect.height -
          0.5) *
        6;

      element.style.setProperty(
        "--contact-x",
        `${x}px`
      );

      element.style.setProperty(
        "--contact-y",
        `${y}px`
      );
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, [emailHover]);

  /* =======================================================
     CMS VALUES
     ======================================================= */

  const label =
    settings.contactLabel?.trim() ?? "";

  const title =
    settings.contactTitle?.trim() ?? "";

  const accent =
    settings.contactAccent?.trim() ?? "";

  const cta =
    settings.contactCta?.trim() ||
    "Get in touch";

  const email =
    settings.contactEmail?.trim() ?? "";

  /* =======================================================
     SCROLL CHOREOGRAPHY
     ======================================================= */

  const labelProgress = easeOut(
    range(
      scrollProgress,
      0.04,
      0.18
    )
  );

  const titleProgress = easeOut(
    range(
      scrollProgress,
      0.10,
      0.38
    )
  );

  const accentProgress = easeOut(
    range(
      scrollProgress,
      0.24,
      0.50
    )
  );

  const emailProgress = easeOut(
    range(
      scrollProgress,
      0.46,
      0.68
    )
  );

  const holdProgress = easeInOut(
    range(
      scrollProgress,
      0.68,
      0.88
    )
  );

  /* =======================================================
     COPY EMAIL
     ======================================================= */

  async function copyEmail() {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(
        email
      );

      setEmailCopied(true);

      window.setTimeout(() => {
        setEmailCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy contact email:",
        error
      );
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full border-t"
      style={{
        height: "220svh",
        background: "transparent",
        color:
          "var(--portfolio-text)",
        borderColor:
          "var(--portfolio-border)",
      }}
    >
      {/* ===================================================
          STICKY CONTACT SCENE
          =================================================== */}

      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          background: "transparent",
        }}
      >
        {/* =================================================
            AMBIENT BACKGROUND
            ================================================= */}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "transparent",
          }}
        />

        {/* Large left orbital ring */}

        <div
          className="pointer-events-none absolute left-[-20rem] top-[12%] h-[42rem] w-[42rem] rounded-full border"
          style={{
            borderColor:
              "var(--portfolio-border)",

            opacity: 0.16,

            transform: `translate3d(0,${
              (1 - holdProgress) * 30
            }px,0)`,
          }}
        />

        {/* Large right orbital ring */}

        <div
          className="pointer-events-none absolute right-[-22rem] bottom-[-18rem] h-[46rem] w-[46rem] rounded-full border"
          style={{
            borderColor:
              "var(--portfolio-border)",

            opacity: 0.10,

            transform: `translate3d(0,${
              holdProgress * -35
            }px,0)`,
          }}
        />

        {/* Center vertical axis */}

        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{
            background:
              "var(--portfolio-border)",

            opacity: 0.07,
          }}
        />

        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-center px-6 md:px-10 lg:px-16">

          {/* =================================================
              CMS SECTION LABEL
              ================================================= */}

          <div
            style={{
              opacity:
                0.15 +
                labelProgress * 0.85,

              transform: `translate3d(0,${
                (1 - labelProgress) * 18
              }px,0)`,
            }}
          >
            <div className="flex items-center gap-4">
              <span
                className="h-px w-10 md:w-16"
                style={{
                  background:
                    "var(--portfolio-accent)",
                }}
              />

              <p
                className="text-[9px] uppercase tracking-[0.32em] md:text-[10px]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              >
                {label}
              </p>
            </div>
          </div>

          {/* =================================================
              CMS TITLE + ACCENT
              ================================================= */}

          <h2 className="mt-10 max-w-[1150px] text-[clamp(3.5rem,9vw,9.5rem)] font-medium leading-[0.86] tracking-[-0.055em] md:mt-14">

            {title && (
              <RevealLine
                text={title}
                progress={titleProgress}
              />
            )}

            {accent && (
              <RevealLine
                text={accent}
                progress={accentProgress}
                accent
              />
            )}
          </h2>

          {/* =================================================
              CONTACT ACTION AREA
              ================================================= */}

          {email && (
            <div
              className="mt-14 flex flex-col gap-8 md:mt-20 md:flex-row md:items-end md:justify-between"
              style={{
                opacity:
                  0.08 +
                  emailProgress * 0.92,

                transform: `translate3d(0,${
                  (1 - emailProgress) * 20
                }px,0)`,
              }}
            >
              {/* ---------------------------------------------
                  EMAIL ADDRESS
                  --------------------------------------------- */}

              <div>
                <p
                  className="mb-3 text-[9px] uppercase tracking-[0.28em]"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  Contact
                </p>

                <button
                  type="button"
                  onClick={copyEmail}
                  className="group flex items-center gap-3 text-left"
                  aria-label={
                    emailCopied
                      ? "Email address copied"
                      : "Copy email address"
                  }
                >
                  <span
                    className="text-sm transition-colors duration-300 md:text-base"
                    style={{
                      color:
                        emailHover
                          ? "var(--portfolio-accent)"
                          : "var(--portfolio-text)",
                    }}
                  >
                    {email}
                  </span>

                  {emailCopied ? (
                    <Check
                      size={14}
                      style={{
                        color:
                          "var(--portfolio-accent)",
                      }}
                    />
                  ) : (
                    <Copy
                      size={14}
                      className="opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        color:
                          "var(--portfolio-muted)",
                      }}
                    />
                  )}
                </button>
              </div>

              {/* ---------------------------------------------
                  CMS CTA
                  --------------------------------------------- */}

              <div
                ref={emailRef}
                onPointerEnter={() =>
                  setEmailHover(true)
                }
                onPointerLeave={() => {
                  setEmailHover(false);

                  emailRef.current?.style.setProperty(
                    "--contact-x",
                    "0px"
                  );

                  emailRef.current?.style.setProperty(
                    "--contact-y",
                    "0px"
                  );
                }}
                className="w-fit"
                style={{
                  transform: `
                    translate3d(
                      var(--contact-x, 0px),
                      var(--contact-y, 0px),
                      0
                    )
                    scale(
                      ${emailHover ? 1.025 : 1}
                    )
                  `,

                  transition:
                    "transform 350ms cubic-bezier(.16,1,.3,1)",
                }}
              >
                <a
                  href={`mailto:${email}`}
                  className="group relative flex items-center gap-8 overflow-hidden rounded-full border px-6 py-4"
                  style={{
                    borderColor:
                      emailHover
                        ? "var(--portfolio-accent)"
                        : "var(--portfolio-border)",

                    background:
                      "var(--portfolio-surface)",

                    color:
                      "var(--portfolio-text)",
                  }}
                  aria-label={`Contact via ${email}`}
                >
                  {/* Accent hover fill */}

                  <span
                    className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                    style={{
                      background:
                        "var(--portfolio-accent)",
                    }}
                  />

                  {/* CMS CTA */}

                  <span
                    className="relative z-10 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300"
                    style={{
                      color:
                        emailHover
                          ? "var(--portfolio-background)"
                          : "var(--portfolio-text)",
                    }}
                  >
                    {cta}
                  </span>

                  {/* Arrow */}

                  <span
                    className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background:
                        emailHover
                          ? "var(--portfolio-background)"
                          : "var(--portfolio-background)",

                      color:
                        emailHover
                          ? "var(--portfolio-accent)"
                          : "var(--portfolio-text)",
                    }}
                  >
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* =================================================
              BOTTOM SYSTEM LINE
              ================================================= */}

          <div
            className="mt-16 flex items-center gap-4 md:mt-24"
            style={{
              opacity:
                holdProgress * 0.5,

              transform: `translate3d(0,${
                (1 - holdProgress) * 8
              }px,0)`,
            }}
          >
            <span
              className="h-px w-12 md:w-20"
              style={{
                background:
                  "var(--portfolio-border)",
              }}
            />

            <span
              className="font-mono text-[8px] uppercase tracking-[0.3em]"
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              {email
                ? "Available for meaningful work"
                : "Contact details unavailable"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
