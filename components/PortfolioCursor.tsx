"use client";

import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

export default function PortfolioCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const target = useRef<Point>({
    x: 0,
    y: 0,
  });

  const position = useRef<Point>({
    x: 0,
    y: 0,
  });

  const previous = useRef<Point>({
    x: 0,
    y: 0,
  });

  const animationFrame = useRef<number | null>(null);

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [clickId, setClickId] = useState(0);

  /*
   * ------------------------------------------------------------
   * POINTER
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      target.current.x = event.clientX;
      target.current.y = event.clientY;

      if (!visible) {
        position.current.x = event.clientX;
        position.current.y = event.clientY;

        previous.current.x = event.clientX;
        previous.current.y = event.clientY;

        setVisible(true);
      }

      const element = event.target;

      if (!(element instanceof Element)) {
        setHovering(false);
        return;
      }

      const interactive = element.closest(
        "a, button, input, textarea, select, [role='button']"
      );

      setHovering(Boolean(interactive));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.pointerType &&
        event.pointerType !== "mouse"
      ) {
        return;
      }

      setPressed(true);
      setClickId((value) => value + 1);
    };

    const handlePointerUp = () => {
      setPressed(false);
    };

    const handleBlur = () => {
      setVisible(false);
      setPressed(false);
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      handlePointerDown,
      { passive: true }
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
      { passive: true }
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, [visible]);

  /*
   * ------------------------------------------------------------
   * LIQUID MOTION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const animate = () => {
      const dx =
        target.current.x -
        position.current.x;

      const dy =
        target.current.y -
        position.current.y;

      /*
       * Smooth following.
       */

      position.current.x += dx * 0.28;
      position.current.y += dy * 0.28;

      /*
       * Movement velocity.
       */

      const vx =
        position.current.x -
        previous.current.x;

      const vy =
        position.current.y -
        previous.current.y;

      previous.current.x =
        position.current.x;

      previous.current.y =
        position.current.y;

      const speed = Math.sqrt(
        vx * vx + vy * vy
      );

      /*
       * Limit the effect so the cursor
       * never becomes excessively distorted.
       */

      const energy = Math.min(
        speed / 14,
        1
      );

      const angle =
        Math.atan2(vy, vx) *
        (180 / Math.PI);

      /*
       * Main cursor position.
       */

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;

        cursorRef.current.style.setProperty(
          "--cursor-energy",
          String(energy)
        );
      }

      /*
       * Liquid deformation.
       */

      if (ringRef.current) {
        const stretch =
          1 + energy * 0.5;

        const squash =
          1 - energy * 0.2;

        ringRef.current.style.transform =
          `translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squash})`;

        /*
         * Subtle organic deformation.
         */

        const radiusA =
          50 - energy * 12;

        const radiusB =
          50 + energy * 12;

        ringRef.current.style.borderRadius =
          `${radiusA}% ${radiusB}% ${radiusB}% ${radiusA}%`;
      }

      animationFrame.current =
        requestAnimationFrame(animate);
    };

    animationFrame.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(
          animationFrame.current
        );
      }
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={[
          "portfolio-liquid-cursor",

          visible
            ? "portfolio-liquid-cursor--visible"
            : "",

          hovering
            ? "portfolio-liquid-cursor--hover"
            : "",

          pressed
            ? "portfolio-liquid-cursor--pressed"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Soft atmosphere */}

        <div className="portfolio-liquid-cursor__glow" />

        {/* Main liquid ring */}

        <div
          ref={ringRef}
          className="portfolio-liquid-cursor__ring"
        />

        {/* Center point */}

        <div className="portfolio-liquid-cursor__core" />

        {/* Click particles */}

        {clickId > 0 &&
          [0, 90, 180, 270].map(
            (angle) => (
              <span
                key={`${clickId}-${angle}`}
                className="portfolio-liquid-cursor__particle"
                style={
                  {
                    "--particle-angle":
                      `${angle}deg`,
                  } as React.CSSProperties
                }
              />
            )
          )}
      </div>

      <CursorActivator />
    </>
  );
}

/*
 * --------------------------------------------------------------
 * ENABLE CUSTOM CURSOR
 * --------------------------------------------------------------
 */

function CursorActivator() {
  useEffect(() => {
    const finePointer =
      window.matchMedia(
        "(pointer: fine)"
      );

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      !finePointer.matches ||
      reducedMotion.matches
    ) {
      return;
    }

    document.documentElement.classList.add(
      "portfolio-custom-cursor"
    );

    return () => {
      document.documentElement.classList.remove(
        "portfolio-custom-cursor"
      );
    };
  }, []);

  return null;
}

/*
 * --------------------------------------------------------------
 * CURSOR STYLES
 * --------------------------------------------------------------
 */

const cursorStyles = `
  html.portfolio-custom-cursor,
  html.portfolio-custom-cursor body,
  html.portfolio-custom-cursor *,
  html.portfolio-custom-cursor a,
  html.portfolio-custom-cursor button,
  html.portfolio-custom-cursor input,
  html.portfolio-custom-cursor textarea,
  html.portfolio-custom-cursor select {
    cursor: none !important;
  }

  .portfolio-liquid-cursor {
    --cursor-color: var(--portfolio-text, #f5f5f5);

    position: fixed;
    left: 0;
    top: 0;

    width: 44px;
    height: 44px;

    pointer-events: none;

    z-index: 2147483647;

    opacity: 0;

    transform:
      translate3d(0, 0, 0)
      translate(-50%, -50%);

    will-change: transform;

    color: var(--cursor-color);

    transition: opacity 160ms ease;
  }

  .portfolio-liquid-cursor--visible {
    opacity: 1;
  }

  .portfolio-liquid-cursor__glow {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 34px;
    height: 34px;

    transform:
      translate(-50%, -50%);

    border-radius: 50%;

    background:
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.09),
        rgba(255, 255, 255, 0) 70%
      );

    filter: blur(4px);

    opacity:
      calc(
        0.25 +
        var(--cursor-energy, 0) * 0.25
      );
  }

  .portfolio-liquid-cursor__ring {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 17px;
    height: 17px;

    transform:
      translate(-50%, -50%);

    box-sizing: border-box;

    border:
      1.5px solid
      var(--cursor-color);

    border-radius: 50%;

    will-change:
      transform,
      border-radius;

    transition:
      width 180ms ease,
      height 180ms ease,
      border-width 180ms ease;
  }

  .portfolio-liquid-cursor__core {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 4px;
    height: 4px;

    transform:
      translate(-50%, -50%);

    border-radius: 50%;

    background:
      var(--cursor-color);

    transition:
      width 160ms ease,
      height 160ms ease,
      transform 160ms ease;
  }

  /*
   * Hover
   */

  .portfolio-liquid-cursor--hover
    .portfolio-liquid-cursor__ring {
    width: 24px;
    height: 24px;

    border-width: 1.8px;
  }

  .portfolio-liquid-cursor--hover
    .portfolio-liquid-cursor__core {
    width: 5px;
    height: 5px;
  }

  /*
   * Click
   */

  .portfolio-liquid-cursor--pressed
    .portfolio-liquid-cursor__ring {
    width: 9px;
    height: 9px;

    border-width: 2px;
  }

  .portfolio-liquid-cursor--pressed
    .portfolio-liquid-cursor__core {
    width: 7px;
    height: 7px;
  }

  /*
   * Click particles
   */

  .portfolio-liquid-cursor__particle {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 3px;
    height: 3px;

    border-radius: 50%;

    background:
      var(--cursor-color);

    animation:
      portfolio-liquid-particle
      420ms
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      )
      forwards;
  }

  @keyframes portfolio-liquid-particle {
    0% {
      opacity: 0.9;

      transform:
        translate(-50%, -50%)
        rotate(var(--particle-angle))
        translateX(6px)
        scale(1);
    }

    100% {
      opacity: 0;

      transform:
        translate(-50%, -50%)
        rotate(var(--particle-angle))
        translateX(30px)
        scale(0.2);
    }
  }

  /*
   * Mobile
   */

  @media (hover: none), (pointer: coarse) {
    .portfolio-liquid-cursor {
      display: none !important;
    }
  }

  /*
   * Reduced motion
   */

  @media (prefers-reduced-motion: reduce) {
    .portfolio-liquid-cursor {
      display: none !important;
    }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById(
    "portfolio-liquid-cursor-styles"
  )
) {
  const style =
    document.createElement("style");

  style.id =
    "portfolio-liquid-cursor-styles";

  style.textContent =
    cursorStyles;

  document.head.appendChild(style);
}