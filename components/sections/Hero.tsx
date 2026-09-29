"use client";

import { useEffect, useState } from "react";
import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";

type Point = { x: number; y: number };

type OrbitPanel = {
  id: string;
  label: string;
  value: string;
  detail: string;
  x: string;
  y: string;
  width: number;
  height: number;
  z: number;
  depth: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  duration: number;
  delay: number;
  opacity: number;
};

const ORBIT_PANELS: OrbitPanel[] = [
  {
    id: "01",
    label: "SYS / 01",
    value: "ONLINE",
    detail: "PORTFOLIO CORE",
    x: "5%",
    y: "8%",
    width: 178,
    height: 94,
    z: 24,
    depth: 0.45,
    rotateX: 7,
    rotateY: -17,
    rotateZ: -7,
    duration: 18,
    delay: -5,
    opacity: 0.72,
  },
  {
    id: "02",
    label: "CODE",
    value: "010 / 110",
    detail: "BUILD SYSTEM",
    x: "67%",
    y: "10%",
    width: 205,
    height: 104,
    z: 20,
    depth: 0.55,
    rotateX: -6,
    rotateY: -15,
    rotateZ: 7,
    duration: 21,
    delay: -11,
    opacity: 0.82,
  },
  {
    id: "03",
    label: "AI / ML",
    value: "INTELLIGENCE",
    detail: "MODEL / ACTIVE",
    x: "1%",
    y: "59%",
    width: 205,
    height: 104,
    z: 42,
    depth: 0.72,
    rotateX: 7,
    rotateY: 15,
    rotateZ: -6,
    duration: 19,
    delay: -8,
    opacity: 0.92,
  },
  {
    id: "04",
    label: "WEB / 3D",
    value: "INTERACTION",
    detail: "SPATIAL INTERFACE",
    x: "70%",
    y: "57%",
    width: 214,
    height: 108,
    z: 44,
    depth: 0.84,
    rotateX: -7,
    rotateY: -11,
    rotateZ: 5,
    duration: 23,
    delay: -15,
    opacity: 0.94,
  },
  {
    id: "05",
    label: "DESIGN",
    value: "VISUAL",
    detail: "SYSTEM / 05",
    x: "15%",
    y: "82%",
    width: 184,
    height: 92,
    z: 30,
    depth: 0.62,
    rotateX: 6,
    rotateY: 16,
    rotateZ: -5,
    duration: 20,
    delay: -3,
    opacity: 0.84,
  },
  {
    id: "06",
    label: "MEDIA",
    value: "MOTION",
    detail: "IMAGE / VIDEO",
    x: "67%",
    y: "82%",
    width: 174,
    height: 88,
    z: 28,
    depth: 0.52,
    rotateX: 5,
    rotateY: -14,
    rotateZ: 6,
    duration: 22,
    delay: -7,
    opacity: 0.76,
  },
];

export default function Hero() {
  const [settings, setSettings] = useState<HomepageSettings>(
    defaultHomepageSettings,
  );
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState<Point>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getHomepageSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load hero settings:", error);
      } finally {
        setLoaded(true);
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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

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
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[var(--portfolio-background)] text-[var(--portfolio-text)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Theme-aware atmospheric field. No vignette. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[69%] top-[50%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{
            opacity: hovered ? 0.28 : 0.17,
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--portfolio-accent) 10%, transparent) 0%, transparent 68%)",
            transform: `translate(calc(-50% + ${mouse.x * 30}px), calc(-50% + ${mouse.y * 22}px))`,
            transition: "opacity 900ms ease",
          }}
        />

        <div
          className="absolute left-[68%] top-[49%] h-[46vw] w-[46vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[115px]"
          style={{
            opacity: hovered ? 0.34 : 0.22,
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--portfolio-text) 7%, transparent) 0%, transparent 70%)",
            transform: `translate(calc(-50% + ${mouse.x * 20}px), calc(-50% + ${mouse.y * 16}px))`,
            transition: "opacity 900ms ease",
          }}
        />

        <div
          className="absolute inset-[-8%] opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            color: "var(--portfolio-border)",
            transform: `translate(${mouse.x * -8}px, ${mouse.y * -6}px)`,
            transition: "transform 1200ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            background:
              "radial-gradient(circle at 68% 50%, var(--portfolio-text), transparent 42%)",
          }}
        />

        <div className="absolute inset-0 opacity-[0.018]">
          <div className="hero-noise h-full w-full" />
        </div>
      </div>

      {/* Hero identity */}
      <div
        className={`absolute left-6 top-7 z-[70] transition-all duration-1000 md:left-10 md:top-10 lg:left-16 ${
          loaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--portfolio-text)]">
          ASHFAQ HYDER
        </p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-[var(--portfolio-muted)]">
          Creative Developer
        </p>
      </div>

      {/* System status */}
      <div
        className={`absolute right-6 top-7 z-[70] text-right transition-all duration-1000 delay-200 md:right-10 md:top-10 lg:right-16 ${
          loaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--portfolio-muted)]">
          Digital / 01
        </p>
        <p className="mt-2 flex items-center justify-end gap-2 text-[9px] uppercase tracking-[0.25em] text-[var(--portfolio-muted)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: "var(--portfolio-accent)",
              boxShadow:
                "0 0 14px color-mix(in srgb, var(--portfolio-accent) 55%, transparent)",
            }}
          />
          System Online
        </p>
      </div>

      {/* Main 3D card composition */}
      <div
        className="pointer-events-none absolute right-[-1vw] top-1/2 z-[30] hidden h-[82vh] w-[59vw] max-w-[860px] -translate-y-1/2 md:block"
        style={{ perspective: "1650px" }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${mouse.y * -2.2}deg) rotateY(${mouse.x * 3.8}deg)`,
            transition: "transform 1100ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Main portrait card */}
          <div
            className="absolute left-1/2 top-1/2 h-[min(66vh,520px)] w-[min(24vw,350px)] -translate-x-1/2 -translate-y-1/2"
            style={{
              zIndex: 38,
              transformStyle: "preserve-3d",
              transform: `translate3d(${mouse.x * 8}px, ${mouse.y * 6}px, 90px)`,
              transition:
                "transform 1000ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Depth layers */}
            {[3, 2, 1].map((depth) => (
              <div
                key={depth}
                className="absolute inset-0 rounded-[2rem] border"
                style={{
                  transform: `translate3d(${depth * -7}px, ${depth * 8}px, ${depth * -24}px)`,
                  backgroundColor:
                    "color-mix(in srgb, var(--portfolio-surface) 82%, var(--portfolio-background))",
                  borderColor:
                    "color-mix(in srgb, var(--portfolio-border) 85%, transparent)",
                  boxShadow:
                    "0 28px 70px color-mix(in srgb, var(--portfolio-background) 70%, transparent)",
                }}
              />
            ))}

            <div
              className="relative h-full w-full overflow-hidden rounded-[2rem] border"
              style={{
                transformStyle: "preserve-3d",
                backgroundColor: "var(--portfolio-surface)",
                borderColor: "color-mix(in srgb, var(--portfolio-border) 95%, transparent)",
                boxShadow:
                  "0 45px 100px color-mix(in srgb, var(--portfolio-background) 72%, transparent), inset 0 1px 0 color-mix(in srgb, var(--portfolio-text) 16%, transparent)",
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="/ashfaq-hero-portrait.png"
                  alt="Ashfaq Hyder"
                  className="h-full w-full object-cover object-[69%_center]"
                  style={{
                    opacity: hovered ? 1 : 0.94,
                    filter: "contrast(1.06) brightness(0.98)",
                    transform: `translate3d(${mouse.x * 4}px, ${mouse.y * 3}px, 35px) scale(1.015)`,
                    transition:
                      "opacity 700ms ease, transform 900ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--portfolio-background) 2%, transparent), transparent 42%, color-mix(in srgb, var(--portfolio-background) 30%, transparent) 100%)",
                  }}
                />

                <div
                  className="absolute inset-0 opacity-[0.13]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, var(--portfolio-text) 1px, transparent 1px), linear-gradient(to bottom, var(--portfolio-text) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
              </div>

              <div
                className="absolute left-0 right-0 top-[39%] h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, color-mix(in srgb, var(--portfolio-text) 45%, transparent), transparent)",
                  animation: "heroScan 5.5s ease-in-out infinite",
                }}
              />

              <div className="absolute inset-x-5 top-5 flex items-start justify-between">
                <div>
                  <p
                    className="text-[8px] uppercase tracking-[0.28em]"
                    style={{ color: "var(--portfolio-text)" }}
                  >
                    PORTRAIT / 01
                  </p>
                  <p
                    className="mt-1 text-[7px] uppercase tracking-[0.24em]"
                    style={{ color: "var(--portfolio-muted)" }}
                  >
                    CREATIVE DEVELOPER
                  </p>
                </div>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--portfolio-accent)",
                    boxShadow:
                      "0 0 14px color-mix(in srgb, var(--portfolio-accent) 60%, transparent)",
                  }}
                />
              </div>

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                <div>
                  <p
                    className="text-[8px] uppercase tracking-[0.24em]"
                    style={{ color: "var(--portfolio-muted)" }}
                  >
                    CODE × DESIGN
                  </p>
                  <p
                    className="mt-1 text-[8px] uppercase tracking-[0.24em]"
                    style={{ color: "var(--portfolio-text)" }}
                  >
                    INTELLIGENCE
                  </p>
                </div>
                <span
                  className="text-[7px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--portfolio-muted)" }}
                >
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* Orbiting cards */}
          {ORBIT_PANELS.map((panel) => {
            const hoverX = mouse.x * 32 * panel.depth;
            const hoverY = mouse.y * 24 * panel.depth;
            const hoverRX = mouse.y * -5 * panel.depth;
            const hoverRY = mouse.x * 7 * panel.depth;
            const hoverZ = hovered ? panel.depth * 100 : 0;

            return (
              <div
                key={panel.id}
                className="absolute"
                style={{
                  left: panel.x,
                  top: panel.y,
                  width: panel.width,
                  height: panel.height,
                  zIndex: panel.z,
                  opacity: panel.opacity,
                  transformStyle: "preserve-3d",
                  animation: `heroFloat ${panel.duration}s ease-in-out ${panel.delay}s infinite`,
                }}
              >
                <div
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `translate3d(${hoverX}px, ${hoverY}px, ${panel.depth * 110 + hoverZ}px) rotateX(${panel.rotateX + hoverRX}deg) rotateY(${panel.rotateY + hoverRY}deg) rotateZ(${panel.rotateZ}deg)`,
                    transition:
                      "transform 1100ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-[1.25rem] border backdrop-blur-xl"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--portfolio-surface) 88%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--portfolio-border) 92%, transparent)",
                      boxShadow:
                        "0 35px 80px color-mix(in srgb, var(--portfolio-background) 68%, transparent), inset 0 1px 0 color-mix(in srgb, var(--portfolio-text) 12%, transparent)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--portfolio-text) 9%, transparent), transparent 32%, transparent 72%, color-mix(in srgb, var(--portfolio-text) 2%, transparent))",
                      }}
                    />

                    <div
                      className="absolute inset-0 opacity-[0.09]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, var(--portfolio-text) 1px, transparent 1px), linear-gradient(to bottom, var(--portfolio-text) 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                      }}
                    />

                    <div className="relative flex h-full flex-col justify-between p-4 md:p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: "var(--portfolio-accent)",
                              boxShadow:
                                "0 0 12px color-mix(in srgb, var(--portfolio-accent) 55%, transparent)",
                            }}
                          />
                          <span
                            className="text-[8px] uppercase tracking-[0.25em]"
                            style={{ color: "var(--portfolio-text)" }}
                          >
                            {panel.label}
                          </span>
                        </div>

                        <span
                          className="text-[7px] uppercase tracking-[0.2em]"
                          style={{ color: "var(--portfolio-muted)" }}
                        >
                          {panel.id}
                        </span>
                      </div>

                      <div>
                        <p
                          className="text-sm uppercase tracking-[0.19em] md:text-base"
                          style={{ color: "var(--portfolio-text)" }}
                        >
                          {panel.value}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className="h-px w-8"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--portfolio-text) 30%, transparent)",
                            }}
                          />
                          <span
                            className="text-[7px] uppercase tracking-[0.2em]"
                            style={{ color: "var(--portfolio-muted)" }}
                          >
                            {panel.detail}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="absolute left-0 right-0 h-px"
                      style={{
                        top: "42%",
                        background:
                          "linear-gradient(90deg, transparent, color-mix(in srgb, var(--portfolio-text) 42%, transparent), transparent)",
                        animation: `heroScan ${5 + panel.depth * 2}s ease-in-out ${panel.delay}s infinite`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div
            className="absolute left-[50%] top-[2%] flex items-center gap-2"
            style={{
              transform: `translate3d(${mouse.x * 38}px, ${mouse.y * 28}px, 260px)`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full border"
              style={{ borderColor: "color-mix(in srgb, var(--portfolio-text) 40%, transparent)" }}
            />
            <span
              className="text-[7px] uppercase tracking-[0.3em]"
              style={{ color: "var(--portfolio-muted)" }}
            >
              SPATIAL / SYSTEM
            </span>
          </div>
        </div>
      </div>

      {/* CMS-driven hero content */}
      <div className="relative z-[55] mx-auto w-full max-w-[1500px] px-6 py-32 md:px-10 lg:px-16">
        <div
          className={`max-w-[650px] transition-all duration-[1400ms] ease-out ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p
            className="mb-7 text-[10px] uppercase tracking-[0.4em] md:text-xs"
            style={{ color: "var(--portfolio-muted)" }}
          >
            {settings.heroEyebrow}
          </p>

          <div style={{ perspective: "1000px" }}>
            <h1
              className="relative w-fit max-w-[700px] text-[clamp(3.8rem,8vw,8.6rem)] font-medium leading-[0.82] tracking-[-0.07em]"
              style={{
                color: "var(--portfolio-text)",
                transformStyle: "preserve-3d",
                transform: `rotateX(${mouse.y * -1.4}deg) rotateY(${mouse.x * 2.2}deg)`,
                transition: "transform 900ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 select-none"
                style={{
                  color: "color-mix(in srgb, var(--portfolio-background) 92%, transparent)",
                  transform: `translate3d(${mouse.x * -7}px, ${mouse.y * -5}px, -35px)`,
                  textShadow:
                    "0 28px 40px color-mix(in srgb, var(--portfolio-background) 88%, transparent)",
                }}
              >
                {settings.heroTitle}
                <br />
                {settings.heroTitleAccent}
              </span>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 select-none"
                style={{
                  color: "color-mix(in srgb, var(--portfolio-text) 8%, transparent)",
                  transform: `translate3d(${mouse.x * -3}px, ${mouse.y * -2}px, -16px)`,
                }}
              >
                {settings.heroTitle}
                <br />
                {settings.heroTitleAccent}
              </span>

              <span className="relative block">
                {settings.heroTitle}
              </span>

              <span
                className="relative block"
                style={{ color: "var(--portfolio-muted)" }}
              >
                {settings.heroTitleAccent}
                <span
                  className="absolute -right-4 top-0 h-2 w-2 rounded-full md:-right-7 md:h-3 md:w-3"
                  style={{
                    backgroundColor: "var(--portfolio-accent)",
                    boxShadow:
                      "0 0 28px color-mix(in srgb, var(--portfolio-accent) 65%, transparent)",
                  }}
                />
              </span>
            </h1>
          </div>

          <div className="mt-10 flex max-w-[700px] flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
            <p
              className="max-w-md text-sm leading-7 md:text-base"
              style={{ color: "var(--portfolio-muted)" }}
            >
              {settings.heroDescription}
            </p>

            <button
              type="button"
              onClick={scrollToProjects}
              className="group flex w-fit shrink-0 items-center gap-4 text-[10px] uppercase tracking-[0.25em] transition-colors duration-500"
              style={{ color: "var(--portfolio-muted)" }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 group-hover:text-[var(--portfolio-accent)]"
                style={{
                  borderColor: "var(--portfolio-border)",
                }}
              >
                ↓
              </span>
              {settings.heroCta}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile portrait card */}
      <div className="pointer-events-none absolute right-[-8rem] top-[54%] z-10 h-[66vh] w-[78vw] -translate-y-1/2 md:hidden">
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.75rem] border"
          style={{
            backgroundColor: "var(--portfolio-surface)",
            borderColor: "var(--portfolio-border)",
            opacity: 0.72,
          }}
        >
          <img
            src="/ashfaq-hero-portrait.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[69%_center]"
          />
        </div>
      </div>

      {/* Footer details */}
      <div className="pointer-events-none absolute bottom-10 left-6 z-[70] md:left-10 lg:left-16">
        <div className="flex items-center gap-3">
          <span
            className="h-px w-8"
            style={{ backgroundColor: "var(--portfolio-border)" }}
          />
          <span
            className="text-[9px] uppercase tracking-[0.25em]"
            style={{ color: "var(--portfolio-muted)" }}
          >
            Scroll to enter
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 right-6 z-[70] md:right-10 lg:right-16">
        <p
          className="text-[9px] uppercase tracking-[0.25em]"
          style={{ color: "var(--portfolio-muted)" }}
        >
          2026
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--portfolio-border) 90%, transparent), transparent)",
        }}
      />

      <style jsx>{`
        .hero-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          animation: heroNoise 0.25s steps(2) infinite;
        }

        @keyframes heroNoise {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(1%, -2%); }
          75% { transform: translate(2%, 2%); }
          100% { transform: translate(0, 0); }
        }

        @keyframes heroFloat {
          0%, 100% {
            margin-top: 0px;
            margin-left: 0px;
          }
          20% {
            margin-top: -12px;
            margin-left: 8px;
          }
          42% {
            margin-top: 5px;
            margin-left: -7px;
          }
          68% {
            margin-top: 12px;
            margin-left: 5px;
          }
          84% {
            margin-top: -4px;
            margin-left: -5px;
          }
        }

        @keyframes heroScan {
          0%, 100% {
            opacity: 0;
            transform: translateY(-180%);
          }
          20% { opacity: 0.7; }
          50% {
            opacity: 0.12;
            transform: translateY(180%);
          }
          65% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-noise {
            animation: none;
          }
        }

        @media (max-width: 900px) {
          .hero-noise {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
