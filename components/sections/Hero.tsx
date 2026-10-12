"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Mono, Manrope, Syne } from "next/font/google";
import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

type Point = {
  x: number;
  y: number;
};

export default function Hero() {
  const [settings, setSettings] = useState<HomepageSettings>(
    defaultHomepageSettings,
  );
  const [mouse, setMouse] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getHomepageSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load hero settings:", error);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    let frame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        setMouse({
          x: (event.clientX / window.innerWidth - 0.5) * 2,
          y: (event.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);


  function scrollToProjects() {
    document.getElementById("projects")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section
      id="hero"
      className={`${syne.variable} ${manrope.variable} ${plexMono.variable} relative min-h-screen w-full overflow-hidden bg-[var(--portfolio-background)] text-[var(--portfolio-text)]`}
    >
{/* =========================================================
          SILHOUETTE DETAIL
          Black remains the CMS background. Fine highlights from the
          silhouette artwork are mapped to the CMS text colour.
          Place ashfaq-hero-detail-mask.png in /public.
         ========================================================= */}
      <div
        aria-hidden="true"
        className="hero-silhouette-draw pointer-events-none absolute inset-x-0 bottom-0 z-[35] h-screen w-screen"
        style={{
          transform: `translate3d(${mouse.x * 6}px, calc(-2vh + ${mouse.y * 5}px), 0)`,
          transition: "transform 1200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "var(--portfolio-surface, var(--portfolio-background))",
            WebkitMaskImage: "url('/ashfaq-hero-silhouette.png')",
            maskImage: "url('/ashfaq-hero-silhouette.png')",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center bottom",
            maskPosition: "center bottom",
            WebkitMaskSize: "auto 100%",
            maskSize: "auto 100%",
            opacity: 0.98,
            filter: "drop-shadow(0 0 1px var(--portfolio-text))",
          }}
        />
      </div>

      {/* =========================================================
          CMS TITLE — LAYER 1
          Solid title sits behind the silhouette.
         ========================================================= */}
      <div className="hero-title-layer hero-title-solid pointer-events-none absolute inset-0 z-[15] flex items-center justify-center overflow-hidden -translate-y-[1.5vh]">
        <h1
          className="w-[108vw] text-center font-[var(--font-syne)] whitespace-nowrap text-[clamp(4.1rem,11.7vw,12.5rem)] font-extrabold uppercase leading-none tracking-[-0.085em] sm:w-[108vw]"
          style={{
            color: "var(--portfolio-text)",
            transform: `translate3d(${mouse.x * -4}px, ${mouse.y * -3}px, 0)`,
          }}
        >
          <span className="hero-title-left">{settings.heroTitle}</span>
          <span className="hero-title-right ml-[0.08em]">{settings.heroTitleAccent}</span>
        </h1>
      </div>

      {/* =========================================================
          CMS TITLE — LAYER 2
          Outline copy is above the silhouette, creating the
          "text passing through the subject" effect.
         ========================================================= */}
      <div className="hero-title-layer hero-title-outline pointer-events-none absolute inset-0 z-[45] flex items-center justify-center overflow-hidden -translate-y-[1.5vh]">
        <h2
          aria-hidden="true"
          className="w-[108vw] text-center font-[var(--font-syne)] whitespace-nowrap text-[clamp(4.1rem,11.7vw,12.5rem)] font-extrabold uppercase leading-none tracking-[-0.085em] sm:w-[108vw]"
          style={{
            color: "transparent",
            WebkitTextStroke:
              "1px color-mix(in srgb, var(--portfolio-text) 72%, transparent)",
            transform: `translate3d(${mouse.x * -4}px, ${mouse.y * -3}px, 0)`,
          }}
        >
          <span className="hero-title-left">{settings.heroTitle}</span>
          <span className="hero-title-right ml-[0.08em]">{settings.heroTitleAccent}</span>
        </h2>
      </div>

      {/* =========================================================
          CMS DESCRIPTION + CTA
         ========================================================= */}
      <div
        className="hero-subtext absolute bottom-[10vh] left-6 z-[70] max-w-[360px] md:left-10 lg:left-16"
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className="h-px w-9"
            style={{ backgroundColor: "var(--portfolio-accent)" }}
          />

          <span
            className="font-[var(--font-plex-mono)] text-[8px] uppercase tracking-[0.3em]"
            style={{ color: "var(--portfolio-muted)" }}
          >
            Code × Design × Intelligence
          </span>
        </div>

        <p
          className="font-[var(--font-manrope)] text-sm leading-6 md:text-[15px] md:leading-7"
          style={{ color: "var(--portfolio-muted)" }}
        >
          {settings.heroDescription}
        </p>

        <button
          type="button"
          onClick={scrollToProjects}
          className="group mt-6 flex items-center gap-4 font-[var(--font-plex-mono)] text-[9px] uppercase tracking-[0.28em]"
          style={{ color: "var(--portfolio-text)" }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-110 group-hover:bg-[var(--portfolio-accent)] group-hover:text-[var(--portfolio-background)]"
            style={{ borderColor: "var(--portfolio-border)" }}
          >
            <span className="transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </span>

          {settings.heroCta}
        </button>
      </div>

      {/* =========================================================
          RIGHT-SIDE EDITORIAL DATA
         ========================================================= */}
      <div className="hero-subtext pointer-events-none absolute bottom-[9vh] right-6 z-[70] hidden text-right md:right-10 md:block lg:right-16">
        <p
          className="font-[var(--font-plex-mono)] text-[8px] uppercase tracking-[0.28em]"
          style={{ color: "var(--portfolio-muted)" }}
        >
          Visual / 01
        </p>

        <div className="mt-3 flex items-center justify-end gap-2">
          <span
            className="h-px w-8"
            style={{ backgroundColor: "var(--portfolio-border)" }}
          />
          <span
            className="font-[var(--font-plex-mono)] text-[8px] uppercase tracking-[0.28em]"
            style={{ color: "var(--portfolio-muted)" }}
          >
            Bengaluru / India
          </span>
        </div>
      </div>

      <style jsx>{`
        /* Mobile fallback: keep hero content visible if an entrance animation
           is throttled or skipped by a mobile browser. Desktop is unchanged. */
        @media (max-width: 768px) {
          .hero-silhouette-draw > div {
            clip-path: none !important;
            animation: none !important;
          }

          .hero-title-layer,
          .hero-title-left,
          .hero-title-right,
          .hero-subtext {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }

        /* Intro sequence: silhouette draws in, title halves glide together,
           then supporting copy and controls reveal. */
        .hero-silhouette-draw > div {
          clip-path: inset(100% 0 0 0);
          animation: silhouette-draw 1.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }

        .hero-title-layer {
          opacity: 0;
          animation: title-layer-reveal 0.01s linear 1.45s forwards;
        }

        .hero-title-left {
          display: inline-block;
          opacity: 0;
          transform: translate3d(-24vw, 0, 0);
          animation: title-from-left 1.25s cubic-bezier(0.16, 1, 0.3, 1) 1.45s forwards;
        }

        .hero-title-right {
          display: inline-block;
          opacity: 0;
          transform: translate3d(24vw, 0, 0);
          animation: title-from-right 1.25s cubic-bezier(0.16, 1, 0.3, 1) 1.45s forwards;
        }

        .hero-subtext {
          opacity: 0;
          transform: translateY(18px);
          animation: subtext-reveal 0.85s cubic-bezier(0.16, 1, 0.3, 1) 2.45s forwards;
        }

        @keyframes silhouette-draw {
          0% { clip-path: inset(100% 0 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }

        @keyframes title-layer-reveal {
          to { opacity: 1; }
        }

        @keyframes title-from-left {
          0% { opacity: 0; transform: translate3d(-24vw, 0, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes title-from-right {
          0% { opacity: 0; transform: translate3d(24vw, 0, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes subtext-reveal {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }

        @media (max-width: 640px) {
          #hero {
            min-height: 100svh;
          }

          #hero h1,
          #hero h2 {
            white-space: normal;
            width: 108vw;
            font-size: clamp(4rem, 17vw, 7rem);
            line-height: 0.82;
          }
        }
      `}</style>
    </section>
  );
}
