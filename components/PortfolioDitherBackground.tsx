"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
};

type StageProfile = {
  density: number;
  interaction: number;
  opacity: number;
};

const STAGES: StageProfile[] = [
  { density: 1.0, interaction: 1.0, opacity: 0.78 }, // Hero (already at maximum density)
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // About
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // Experience
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // Projects
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // Achievements
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // Skills
  { density: 1.0, interaction: 0.50, opacity: 0.78 }, // Digital Lab
  { density: 1.0, interaction: 0.5, opacity: 0.78 }, // Creative Lab
  { density: 0.500, interaction: 0.500, opacity: 0.28 }, // Photography
  { density: 1.0, interaction: 0.5, opacity: 0.78 }, // Contact
  { density: 0.525, interaction: 0.5, opacity: 0.78 }, // Footer
];

const DESKTOP_PARTICLES = 2600;
const MOBILE_PARTICLES = 900;

const INTERACTION_RADIUS = 145;
const INTERACTION_RADIUS_SQ =
  INTERACTION_RADIUS * INTERACTION_RADIUS;

const RETURN_STRENGTH = 0.055;
const DAMPING = 0.82;
const MAX_DISPLACEMENT = 42;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * t;

const smoothstep = (t: number) => {
  const v = clamp(t);
  return v * v * (3 - 2 * v);
};

function getStageProfile(progress: number): StageProfile {
  const scaled = clamp(progress) * (STAGES.length - 1);
  const index = Math.min(
    STAGES.length - 2,
    Math.floor(scaled),
  );
  const local = smoothstep(scaled - index);

  const current = STAGES[index]!;
  const next = STAGES[index + 1]!;

  return {
    density: lerp(current.density, next.density, local),
    interaction: lerp(
      current.interaction,
      next.interaction,
      local,
    ),
    opacity: lerp(current.opacity, next.opacity, local),
  };
}

export default function PortfolioDitherBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /*
     * IMPORTANT:
     * Store the DOM nodes in local constants and narrow them before
     * declaring nested functions. TypeScript then knows that both
     * values cannot become null inside resize(), draw(), etc.
     */
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    const contextElement = canvasElement.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!contextElement) return;

    const canvas = canvasElement;
    const ctx = contextElement;

    let width = 1;
    let height = 1;
    let dpr = 1;

    let particles: Particle[] = [];
    let animationFrame = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    let targetMouseX = -10000;
    let targetMouseY = -10000;
    let mouseX = -10000;
    let mouseY = -10000;
    let mouseActive = false;

    let scrollProgress = 0;
    let textColor = "#ffffff";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const readTheme = () => {
      // AppearanceProvider owns the public theme variables on its wrapper
      // on some viewports. Read that source first, then fall back to html/body.
      const publicTheme = document.querySelector<HTMLElement>(
        '[data-portfolio-public="true"]',
      );
      const themeStyles = publicTheme ? getComputedStyle(publicTheme) : null;
      const rootStyles = getComputedStyle(document.documentElement);
      const bodyStyles = getComputedStyle(document.body);

      textColor =
        themeStyles?.getPropertyValue("--portfolio-text").trim() ||
        rootStyles.getPropertyValue("--portfolio-text").trim() ||
        bodyStyles.getPropertyValue("--portfolio-text").trim() ||
        "#ffffff";
    };

    const getScrollProgress = () => {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (documentHeight <= 0) {
        scrollProgress = 0;
        return;
      }

      scrollProgress = clamp(
        window.scrollY / documentHeight,
      );
    };

    const createParticles = () => {
      const count = window.matchMedia("(max-width: 768px)")
        .matches
        ? MOBILE_PARTICLES
        : DESKTOP_PARTICLES;

      particles = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;

        return {
          x,
          y,
          homeX: x,
          homeY: y,
          vx: 0,
          vy: 0,
          size:
            Math.random() < 0.12
              ? Math.random() * 1.5 + 1.8
              : Math.random() < 0.86
                ? Math.random() * 1.15 + 0.35
                : Math.random() * 1.6 + 0.6,
          alpha:
            Math.random() * 0.55 + 0.22,
          phase:
            Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      createParticles();
      readTheme();
      getScrollProgress();
    };

    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      resizeTimer = setTimeout(() => {
        resize();
      }, 80);
    };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      targetMouseX = event.clientX;
      targetMouseY = event.clientY;
      mouseActive = true;
    };

    const handlePointerLeave = () => {
      mouseActive = false;
      targetMouseX = -10000;
      targetMouseY = -10000;
    };

    const handleScroll = () => {
      getScrollProgress();
    };

    const draw = (time: number) => {
      const profile =
        getStageProfile(scrollProgress);

      const motionMultiplier = reducedMotion.matches
        ? 0
        : 1;

      mouseX +=
        (targetMouseX - mouseX) * 0.10;
      mouseY +=
        (targetMouseY - mouseY) * 0.10;

      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      ctx.fillStyle = textColor;

      const visibleCount = Math.floor(
        particles.length * profile.density,
      );

      for (let i = 0; i < visibleCount; i++) {
        const particle = particles[i]!;

        /*
         * Very subtle organic motion keeps the dither alive
         * even when the pointer is not moving.
         */
        if (motionMultiplier > 0) {
          particle.homeX +=
            Math.sin(
              time * 0.00028 +
                particle.phase,
            ) * 0.018;

          particle.homeY +=
            Math.cos(
              time * 0.00025 +
                particle.phase,
            ) * 0.018;
        }

        let forceX = 0;
        let forceY = 0;

        if (
          mouseActive &&
          motionMultiplier > 0
        ) {
          const dx =
            particle.x - mouseX;
          const dy =
            particle.y - mouseY;

          const distanceSq =
            dx * dx + dy * dy;

          if (
            distanceSq <
            INTERACTION_RADIUS_SQ
          ) {
            const distance =
              Math.sqrt(distanceSq) ||
              0.001;

            const falloff =
              1 -
              distance /
                INTERACTION_RADIUS;

            const force =
              falloff *
              falloff *
              profile.interaction *
              2.8;

            forceX =
              (dx / distance) * force;
            forceY =
              (dy / distance) * force;
          }
        }

        /*
         * Spring back toward the original position.
         */
        forceX +=
          (particle.homeX -
            particle.x) *
          RETURN_STRENGTH;

        forceY +=
          (particle.homeY -
            particle.y) *
          RETURN_STRENGTH;

        particle.vx += forceX;
        particle.vy += forceY;

        particle.vx *= DAMPING;
        particle.vy *= DAMPING;

        particle.x +=
          particle.vx * motionMultiplier;
        particle.y +=
          particle.vy * motionMultiplier;

        /*
         * Keep displacement bounded so a particle can never
         * permanently escape its original field.
         */
        const displacementX =
          particle.x -
          particle.homeX;
        const displacementY =
          particle.y -
          particle.homeY;

        const displacementSq =
          displacementX *
            displacementX +
          displacementY *
            displacementY;

        if (
          displacementSq >
          MAX_DISPLACEMENT *
            MAX_DISPLACEMENT
        ) {
          const displacement =
            Math.sqrt(
              displacementSq,
            ) || 1;

          particle.x =
            particle.homeX +
            (displacementX /
              displacement) *
              MAX_DISPLACEMENT;

          particle.y =
            particle.homeY +
            (displacementY /
              displacement) *
              MAX_DISPLACEMENT;

          particle.vx *= 0.5;
          particle.vy *= 0.5;
        }

        if (particle.x < -4)
          particle.x = width + 4;
        if (particle.x > width + 4)
          particle.x = -4;
        if (particle.y < -4)
          particle.y = height + 4;
        if (particle.y > height + 4)
          particle.y = -4;

        const dx =
          particle.x - mouseX;
        const dy =
          particle.y - mouseY;

        const distanceSq =
          dx * dx + dy * dy;

        let glow = 1;

        if (
          mouseActive &&
          distanceSq <
            INTERACTION_RADIUS_SQ
        ) {
          const distance =
            Math.sqrt(distanceSq);
          glow =
            1 +
            (1 -
              distance /
                INTERACTION_RADIUS) *
              1.7 *
              profile.interaction;
        }

        ctx.globalAlpha = Math.min(
          0.95,
          particle.alpha *
            profile.opacity *
            glow,
        );

        const size =
          particle.size * glow;

        ctx.fillRect(
          particle.x - size * 0.5,
          particle.y - size * 0.5,
          size,
          size,
        );
      }

      ctx.globalAlpha = 1;

      animationFrame =
        requestAnimationFrame(draw);
    };

    /*
     * Appearance CMS updates CSS variables at runtime.
     * Watch html/body attributes so the canvas immediately
     * picks up the new CMS text color without remounting.
     */
    const appearanceObserver =
      new MutationObserver(() => {
        readTheme();
      });

    appearanceObserver.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["style", "class"],
      },
    );

    appearanceObserver.observe(
      document.body,
      {
        attributes: true,
        attributeFilter: ["style", "class"],
      },
    );

    const publicTheme = document.querySelector<HTMLElement>(
      '[data-portfolio-public="true"]',
    );
    if (publicTheme) {
      appearanceObserver.observe(publicTheme, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    readTheme();
    resize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true },
    );

    window.addEventListener(
      "pointerleave",
      handlePointerLeave,
      { passive: true },
    );

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );

      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      appearanceObserver.disconnect();

      ctx.clearRect(
        0,
        0,
        width,
        height,
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-screen w-screen"
      style={{
        display: "block",
        background: "transparent",
      }}
    />
  );
}
