"use client";

import { useEffect, useRef, useState } from "react";

interface LandingIntroProps {
  onNavigationReveal: () => void;
  onComplete: () => void;
}

type Stage =
  | "black"
  | "logo"
  | "sweep"
  | "loading"
  | "complete"
  | "contract"
  | "travel";

const NAV_LEFT = 4;
const NAV_TOP = 3;
const NAV_SIZE = 42;

const LOGO_WIDTH = 280;
const LOGO_HEIGHT = 223;

const LOADING_DURATION = 3100;
const TRAVEL_DURATION = 1100;

const messages = [
  {
    min: 0,
    max: 15,
    text: "CODE × DESIGN × INTELLIGENCE",
  },
  {
    min: 15,
    max: 30,
    text: "BUILDING DIGITAL EXPERIENCES",
  },
  {
    min: 30,
    max: 45,
    text: "WHERE TECHNOLOGY BECOMES VISUAL",
  },
  {
    min: 45,
    max: 60,
    text: "CREATIVE DEVELOPMENT IN MOTION",
  },
  {
    min: 60,
    max: 75,
    text: "AI × WEB × INTERACTION",
  },
  {
    min: 75,
    max: 90,
    text: "IDEAS INTO INTERACTIVE SYSTEMS",
  },
  {
    min: 90,
    max: 100,
    text: "PREPARING THE EXPERIENCE",
  },
];

const getMessage = (value: number) => {
  if (value >= 100) return "WELCOME TO THE PORTFOLIO";

  return (
    messages.find(
      (message) =>
        value >= message.min &&
        value < message.max,
    )?.text ?? messages[0].text
  );
};

export default function LandingIntro({
  onNavigationReveal,
  onComplete,
}: LandingIntroProps) {
  const [stage, setStage] = useState<Stage>("black");
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const completeRef = useRef(onComplete);
  const navigationRef = useRef(onNavigationReveal);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    navigationRef.current = onNavigationReveal;
  }, [onNavigationReveal]);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    setReducedMotion(media.matches);

    const handleChange = () => {
      setReducedMotion(media.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, []);

  /*
   * New simplified cinematic sequence:
   *
   * 0.00  black
   * 0.35  real AH logo appears
   * 1.05  logo stabilizes
   * 1.25  light sweep
   * 1.65  loading system begins
   * 4.75  loading reaches 100%
   * 5.05  completion message
   * 5.45  logo contracts to 42px
   * 5.85  logo physically travels to navbar
   * 6.95  hero reveal
   *
   * There is deliberately:
   * - no name
   * - no fake AH construction
   * - no loading ring
   * - no travel trail
   * - no curved travel path
   */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reducedMotion) {
      setProgress(100);
      setStage("complete");

      timers.push(
        setTimeout(() => {
          setStage("contract");
        }, 350),
      );

      timers.push(
        setTimeout(() => {
          navigationRef.current();
          setStage("travel");
        }, 700),
      );

      timers.push(
        setTimeout(() => {
          completeRef.current();
        }, 1900),
      );

      return () => timers.forEach(clearTimeout);
    }

    timers.push(
      setTimeout(() => {
        setStage("logo");
      }, 350),
    );

    timers.push(
      setTimeout(() => {
        setStage("sweep");
      }, 1050),
    );

    timers.push(
      setTimeout(() => {
        setStage("loading");
      }, 1650),
    );

    timers.push(
      setTimeout(() => {
        setProgress(100);
        setStage("complete");
      }, 4750),
    );

    timers.push(
      setTimeout(() => {
        setStage("contract");
      }, 5150),
    );

    timers.push(
      setTimeout(() => {
        navigationRef.current();
        setStage("travel");
      }, 5550),
    );

    timers.push(
      setTimeout(() => {
        completeRef.current();
      }, 6950),
    );

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  /*
   * Loading progress is independent from the stage timeline.
   * This prevents the progress animation from fighting the
   * main transition state.
   */
  useEffect(() => {
    if (stage !== "loading") return;

    setProgress(0);

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const raw = Math.min(
        (now - start) / LOADING_DURATION,
        1,
      );

      /*
       * Slightly eased progress:
       * quick beginning → slower middle → confident finish.
       */
      const eased =
        raw < 0.85
          ? raw / 0.85 * 0.91
          : 0.91 +
            ((raw - 0.85) / 0.15) * 0.09;

      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [stage]);

  const message = getMessage(progress);

  const showLogo =
    stage !== "black";

  const logoIsSmall =
    stage === "contract" ||
    stage === "travel";

  const logoIsTraveling =
    stage === "travel";

  const showLoading =
    stage === "loading" ||
    stage === "complete";

  const showComplete =
    stage === "complete";

  const logoPosition = logoIsTraveling
    ? {
        left: `${NAV_LEFT}px`,
        top: `${NAV_TOP}px`,
        width: `${NAV_SIZE}px`,
        height: `${NAV_SIZE}px`,
      }
    : logoIsSmall
      ? {
          left: "calc(50% - 21px)",
          top: "calc(50% - 21px)",
          width: `${NAV_SIZE}px`,
          height: `${NAV_SIZE}px`,
        }
      : {
          left: "calc(50% - 140px)",
          top: "calc(50% - 111.5px)",
          width: `${LOGO_WIDTH}px`,
          height: `${LOGO_HEIGHT}px`,
        };

  const logoTransition = logoIsTraveling
    ? [
        `left ${TRAVEL_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
        `top ${TRAVEL_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
      ].join(", ")
    : [
        "left 0ms",
        "top 0ms",
        "width 400ms cubic-bezier(0.22,1,0.36,1)",
        "height 400ms cubic-bezier(0.22,1,0.36,1)",
      ].join(", ");

  return (
    <section
      aria-label="Portfolio loading introduction"
      className="fixed inset-0 z-[200] overflow-hidden bg-transparent text-[var(--portfolio-text)]"
    >
      {/* =========================================================
          CINEMATIC FIELD
         ========================================================= */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--portfolio-text) 5%, transparent), transparent 30%, transparent 76%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--portfolio-text) 2%, transparent), transparent)",
        }}
      />

      {/* =========================================================
          TOP BRANDING
         ========================================================= */}

      <div
        className="pointer-events-none absolute left-[24px] top-[22px] md:left-[48px] md:top-[30px]"
        style={{
          opacity:
            stage === "black"
              ? 0.45
              : 0.82,
          transition: "opacity 700ms ease",
        }}
      >
        

        <div className="mt-2 text-[7px] uppercase tracking-[0.36em] text-[var(--portfolio-muted)] md:text-[8px]">
          CREATIVE DEVELOPER&nbsp;&nbsp;•&nbsp;&nbsp;AI / ML&nbsp;&nbsp;•&nbsp;&nbsp;INTERACTIVE
        </div>
      </div>

      <div
        className="pointer-events-none absolute right-[24px] top-[30px] hidden text-right md:right-[48px] md:block"
        style={{
          opacity:
            stage === "black"
              ? 0.3
              : 0.65,
          transition: "opacity 700ms ease",
        }}
      >
        <div className="text-[7px] uppercase tracking-[0.35em] text-[var(--portfolio-muted)]">
          2026
        </div>

        <div className="mt-2 text-[7px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
          INITIALIZING SYSTEM
        </div>
      </div>

      {/* =========================================================
          REAL AH LOGO
         ========================================================= */}

      {showLogo && (
        <div
          className="absolute"
          style={{
            left: logoPosition.left,
            top: logoPosition.top,
            width: logoPosition.width,
            height: logoPosition.height,

            transition: logoTransition,

            willChange: "left, top, width, height",

            zIndex: 5,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              backgroundColor: "var(--portfolio-text)",
              WebkitMaskImage: "url('/ashfaq-hyder-logo.png')",
              maskImage: "url('/ashfaq-hyder-logo.png')",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              opacity:
                stage === "logo"
                  ? 0
                  : 1,
              transform:
                stage === "logo"
                  ? "scale(0.94)"
                  : "scale(1)",
              filter:
                "drop-shadow(0 0 12px color-mix(in srgb, var(--portfolio-text) 18%, transparent))",
              transition:
                "opacity 850ms cubic-bezier(0.22,1,0.36,1), transform 1100ms cubic-bezier(0.22,1,0.36,1)",
              willChange: "opacity, transform",
            }}
          />

          {/* Soft logo reveal layer */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--portfolio-text) 22%, transparent), transparent 58%)",
              opacity:
                stage === "logo"
                  ? 0.55
                  : 0,
              transition:
                "opacity 900ms ease",
            }}
          />
        </div>
      )}

      {/* =========================================================
          LIGHT SWEEP
         ========================================================= */}

      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width:
            stage === "sweep"
              ? "760px"
              : "0px",
          height: "2px",

          transform:
            stage === "sweep"
              ? "translate(-50%, -50%) rotate(-18deg)"
              : "translate(-50%, -50%) rotate(-18deg)",

          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--portfolio-text) 95%, transparent), transparent)",

          boxShadow:
            "0 0 20px color-mix(in srgb, var(--portfolio-text) 55%, transparent)",

          opacity:
            stage === "sweep"
              ? 1
              : 0,

          transition:
            "width 850ms cubic-bezier(0.16,1,0.3,1), opacity 450ms ease",
        }}
      />

      {/* =========================================================
          LOADING SYSTEM
         ========================================================= */}

      <div
        className="pointer-events-none absolute left-1/2 flex flex-col items-center text-center"
        style={{
          /*
           * The loading system is anchored to the exact horizontal
           * center of the 280px × 223px logo.
           *
           * Logo center: 50% / 50%
           * Logo bottom: 50% + 111.5px
           * Loading system: 18px below that edge
           *
           * Using the same left: 50% anchor and a fixed composition
           * width removes any independent horizontal positioning.
           */
          top: "calc(50% + 129.5px)",
          width: "min(420px, 72vw)",

          opacity:
            showLoading
              ? 1
              : 0,

          transform:
            showLoading
              ? "translate(-50%, 0)"
              : "translate(-50%, 10px)",

          transition:
            "opacity 650ms ease, transform 650ms cubic-bezier(0.16,1,0.3,1)",

          zIndex: 8,
        }}
      >
        {/* Tagline — immediately below the actual logo boundary */}
        <div
          className="flex h-[18px] w-full items-center justify-center overflow-hidden text-center"
        >
          <div
            key={message}
            className="w-full text-center text-[8px] uppercase tracking-[0.40em] text-[var(--portfolio-text)] md:text-[9px]"
            style={{
              animation:
                "portfolioMessageIn 500ms cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            {message}
          </div>
        </div>

        {/* Progress bar — directly beneath the tagline */}
        <div
          className="relative mt-4 h-[2px] w-[min(420px,68vw)] overflow-hidden"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--portfolio-text) 10%, transparent)",
          }}
        >
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: `${progress}%`,
              background:
                "var(--portfolio-text)",
              boxShadow:
                "0 0 12px color-mix(in srgb, var(--portfolio-text) 35%, transparent)",
              transition:
                "width 100ms linear",
            }}
          />

          <div
            className="absolute top-1/2 h-[8px] w-[34px]"
            style={{
              left:
                `calc(${Math.max(progress - 3, 0)}% - 17px)`,
              transform: "translateY(-50%)",
              background:
                "radial-gradient(ellipse, color-mix(in srgb, var(--portfolio-text) 90%, transparent), transparent 70%)",
              opacity:
                progress > 0 && progress < 100
                  ? 0.8
                  : 0,
              filter: "blur(1px)",
              transition:
                "left 100ms linear",
            }}
          />
        </div>

        {/* Status + percentage — centered under the bar */}
        <div className="mt-3 flex w-[min(420px,68vw)] items-center justify-center gap-5 text-center">
          <span className="text-[7px] uppercase tracking-[0.30em] text-[var(--portfolio-muted)]">
            {showComplete ? "READY" : "INITIALIZING"}
          </span>

          <span className="text-[8px] tabular-nums tracking-[0.22em] text-[var(--portfolio-muted)]">
            {String(progress).padStart(3, "0")}%
          </span>
        </div>
      </div>

      {/* =========================================================
          COMPLETION MESSAGE
         ========================================================= */}

      <div
        className="pointer-events-none absolute left-1/2 top-[23%] -translate-x-1/2 whitespace-nowrap"
        style={{
          opacity:
            showComplete
              ? 1
              : 0,

          transform:
            showComplete
              ? "translate(-50%, 0)"
              : "translate(-50%, 7px)",

          transition:
            "opacity 600ms ease, transform 600ms cubic-bezier(0.16,1,0.3,1)",

          zIndex: 8,
        }}
      >
        <div className="text-[7px] uppercase tracking-[0.46em] text-[var(--portfolio-muted)]">
          SYSTEM READY
        </div>
      </div>

      {/* =========================================================
          NAVBAR ENDPOINT — INVISIBLE
         ========================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed"
        style={{
          left: NAV_LEFT,
          top: NAV_TOP,
          width: NAV_SIZE,
          height: NAV_SIZE,
          opacity: 0,
        }}
      />

      {/* =========================================================
          FOOTER IDENTITY
         ========================================================= */}

      <div className="pointer-events-none absolute bottom-[28px] left-[24px] right-[24px] hidden items-center gap-6 md:flex">
        <span className="text-[7px] uppercase tracking-[0.32em] text-[var(--portfolio-muted)]">
          CODE × DESIGN × INTELLIGENCE
        </span>

        <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--portfolio-text)_8%,transparent)]" />

        <span className="text-[7px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
          FROM A POINT TO A PURPOSE
        </span>
      </div>

      <style>{`
        @keyframes portfolioMessageIn {
          from {
            opacity: 0;
            transform: translateY(9px);
            filter: blur(3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes portfolioMessageIn {
            from, to {
              opacity: 1;
              transform: none;
              filter: none;
            }
          }
        }
      `}</style>
    </section>
  );
}
