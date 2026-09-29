"use client";

import { useEffect } from "react";

/**
 * PortfolioCursor
 *
 * Liquid-style pointer for the public portfolio.
 *
 * Behaviour:
 * - Directional stretching based on pointer velocity
 * - Viscous trailing through spring/damped interpolation
 * - Hover deformation over interactive elements
 * - Click compression + elastic recovery
 * - Disabled for touch/coarse pointers
 * - Respects prefers-reduced-motion
 *
 * Drop-in usage:
 *   import PortfolioCursor from "@/components/PortfolioCursor";
 *   ...
 *   <PortfolioCursor />
 */
export default function PortfolioCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    const root = document.documentElement;

    const cursor = document.createElement("div");
    const blob = document.createElement("div");
    const ripple = document.createElement("div");

    cursor.setAttribute("aria-hidden", "true");
    blob.setAttribute("aria-hidden", "true");
    ripple.setAttribute("aria-hidden", "true");

    cursor.className = "portfolio-liquid-cursor";
    blob.className = "portfolio-liquid-cursor__blob";
    ripple.className = "portfolio-liquid-cursor__ripple";

    cursor.appendChild(ripple);
    cursor.appendChild(blob);
    document.body.appendChild(cursor);

    const style = document.createElement("style");
    style.textContent = `
      html.portfolio-liquid-cursor-active,
      html.portfolio-liquid-cursor-active body,
      html.portfolio-liquid-cursor-active a,
      html.portfolio-liquid-cursor-active button,
      html.portfolio-liquid-cursor-active [role="button"],
      html.portfolio-liquid-cursor-active input,
      html.portfolio-liquid-cursor-active textarea,
      html.portfolio-liquid-cursor-active select {
        cursor: none !important;
      }

      .portfolio-liquid-cursor {
        --cursor-size: 13px;
        --cursor-scale-x: 1;
        --cursor-scale-y: 1;
        --cursor-rotation: 0deg;
        --cursor-opacity: 1;
        position: fixed;
        left: 0;
        top: 0;
        width: var(--cursor-size);
        height: var(--cursor-size);
        z-index: 2147483647;
        pointer-events: none;
        opacity: var(--cursor-opacity);
        transform:
          translate3d(
            calc(var(--cursor-x, -100px) - 50%),
            calc(var(--cursor-y, -100px) - 50%),
            0
          );
        will-change: transform, opacity;
      }

      .portfolio-liquid-cursor__blob {
        position: absolute;
        inset: 0;
        border: 1px solid rgba(255, 255, 255, 0.88);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.035);
        box-shadow:
          0 0 0 0.5px rgba(255, 255, 255, 0.10) inset,
          0 0 18px rgba(255, 255, 255, 0.045);
        transform:
          rotate(var(--cursor-rotation))
          scaleX(var(--cursor-scale-x))
          scaleY(var(--cursor-scale-y));
        transform-origin: 50% 50%;
        will-change: transform, border-radius;
        transition:
          width 180ms cubic-bezier(.22, 1, .36, 1),
          height 180ms cubic-bezier(.22, 1, .36, 1),
          border-radius 220ms cubic-bezier(.22, 1, .36, 1),
          background 180ms ease,
          border-color 180ms ease;
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
      }

      .portfolio-liquid-cursor__ripple {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 28px;
        height: 28px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0.45);
        opacity: 0;
        will-change: transform, opacity;
      }

      .portfolio-liquid-cursor.is-hovering .portfolio-liquid-cursor__blob {
        border-radius: 42% 58% 55% 45% / 50% 44% 56% 50%;
        border-color: rgba(255, 255, 255, 0.98);
        background: rgba(255, 255, 255, 0.07);
      }

      .portfolio-liquid-cursor.is-hovering .portfolio-liquid-cursor__ripple {
        opacity: 0.32;
      }

      .portfolio-liquid-cursor.is-pressed .portfolio-liquid-cursor__blob {
        border-radius: 48% 52% 54% 46% / 55% 44% 56% 45%;
      }

      @media (hover: none), (pointer: coarse) {
        .portfolio-liquid-cursor {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    root.classList.add("portfolio-liquid-cursor-active");

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;

    let x = targetX;
    let y = targetY;

    let previousTargetX = targetX;
    let previousTargetY = targetY;

    let velocityX = 0;
    let velocityY = 0;

    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;

    let hover = false;
    let pressed = false;
    let visible = false;
    let raf = 0;

    const interactiveSelector = [
      "a",
      "button",
      "[role='button']",
      "input",
      "textarea",
      "select",
      "summary",
      "[data-cursor-hover]",
    ].join(",");

    const setPointerPosition = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        x = targetX;
        y = targetY;
        visible = true;
      }
    };

    const updateHover = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        hover = false;
        cursor.classList.remove("is-hovering");
        return;
      }

      const interactive = target.closest(interactiveSelector);
      hover = Boolean(interactive);
      cursor.classList.toggle("is-hovering", hover);
    };

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      setPointerPosition(event);
      updateHover(event);
    };

    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      pressed = true;
      cursor.classList.add("is-pressed");

      blob.animate(
        [
          {
            transform: `
              rotate(${rotation}deg)
              scaleX(${scaleX})
              scaleY(${scaleY})
            `,
          },
          {
            transform: `
              rotate(${rotation}deg)
              scaleX(${scaleX * 0.72})
              scaleY(${scaleY * 1.18})
            `,
          },
          {
            transform: `
              rotate(${rotation}deg)
              scaleX(${scaleX * 1.06})
              scaleY(${scaleY * 0.96})
            `,
          },
          {
            transform: `
              rotate(${rotation}deg)
              scaleX(${scaleX})
              scaleY(${scaleY})
            `,
          },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(.22, 1, .36, 1)",
        }
      );

      ripple.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(0.25)",
            opacity: 0.55,
          },
          {
            transform: "translate(-50%, -50%) scale(1.55)",
            opacity: 0,
          },
        ],
        {
          duration: 520,
          easing: "cubic-bezier(.22, 1, .36, 1)",
        }
      );
    };

    const pointerUp = () => {
      pressed = false;
      cursor.classList.remove("is-pressed");
    };

    const pointerLeave = () => {
      visible = false;
      cursor.style.setProperty("--cursor-opacity", "0");
    };

    const pointerEnter = (event: PointerEvent) => {
      visible = true;
      targetX = event.clientX;
      targetY = event.clientY;
      x = targetX;
      y = targetY;
      cursor.style.setProperty("--cursor-opacity", "1");
    };

    const animate = () => {
      /*
       * Spring-like position interpolation.
       * The low-ish stiffness creates the viscous "following" sensation
       * without producing an obvious delayed cursor.
       */
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;

      const rawVX = targetX - previousTargetX;
      const rawVY = targetY - previousTargetY;

      previousTargetX = targetX;
      previousTargetY = targetY;

      velocityX += (rawVX - velocityX) * 0.18;
      velocityY += (rawVY - velocityY) * 0.18;

      const speed = Math.min(
        Math.hypot(velocityX, velocityY),
        55
      );

      const direction = Math.atan2(velocityY, velocityX);
      const speedRatio = speed / 55;

      /*
       * Stretch along the direction of movement and compress on the
       * perpendicular axis. The effect eases back naturally when stopped.
       */
      const targetScaleX = 1 + speedRatio * 0.72;
      const targetScaleY = 1 - speedRatio * 0.28;

      scaleX += (targetScaleX - scaleX) * 0.18;
      scaleY += (targetScaleY - scaleY) * 0.18;

      if (speed > 0.15) {
        let targetRotation = (direction * 180) / Math.PI;

        /*
         * Avoid unnecessary rotation jumps around ±180 degrees.
         */
        while (targetRotation - rotation > 180) {
          targetRotation -= 360;
        }

        while (targetRotation - rotation < -180) {
          targetRotation += 360;
        }

        rotation += (targetRotation - rotation) * 0.16;
      } else {
        scaleX += (1 - scaleX) * 0.12;
        scaleY += (1 - scaleY) * 0.12;
        rotation += (0 - rotation) * 0.08;
      }

      /*
       * Hover adds a subtle organic deformation rather than a simple
       * size change.
       */
      if (hover) {
        scaleX += (1.13 - scaleX) * 0.08;
        scaleY += (0.94 - scaleY) * 0.08;
      }

      /*
       * Pointer-down slightly compresses the live state as well, while
       * the Web Animation above supplies the elastic impact.
       */
      if (pressed) {
        scaleX += (0.86 - scaleX) * 0.12;
        scaleY += (0.86 - scaleY) * 0.12;
      }

      cursor.style.setProperty("--cursor-x", `${x}px`);
      cursor.style.setProperty("--cursor-y", `${y}px`);
      cursor.style.setProperty("--cursor-scale-x", scaleX.toFixed(3));
      cursor.style.setProperty("--cursor-scale-y", scaleY.toFixed(3));
      cursor.style.setProperty("--cursor-rotation", `${rotation.toFixed(2)}deg`);
      cursor.style.setProperty("--cursor-opacity", visible ? "1" : "0");

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", pointerUp, { passive: true });
    window.addEventListener("pointercancel", pointerUp, { passive: true });
    window.addEventListener("pointerenter", pointerEnter, { passive: true });
    window.addEventListener("pointerleave", pointerLeave, { passive: true });

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("pointerenter", pointerEnter);
      window.removeEventListener("pointerleave", pointerLeave);

      root.classList.remove("portfolio-liquid-cursor-active");
      cursor.remove();
      style.remove();
    };
  }, []);

  return null;
}
