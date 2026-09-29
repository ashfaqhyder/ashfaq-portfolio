
"use client";

import {
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
}

type DirectionOffset = {
  x: number;
  y: number;
};

const directionMap: Record<
  NonNullable<ScrollRevealProps["direction"]>,
  DirectionOffset
> = {
  up: { x: 0, y: 100 },
  down: { x: 0, y: -100 },
  left: { x: 100, y: 0 },
  right: { x: -100, y: 0 },
};

export default function ScrollReveal({
  children,
  className = "",
  direction = "up",
  duration = 0.8,
  delay = 0,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          x: directionMap[direction].x,
          y: directionMap[direction].y,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          duration,
          delay,
          ease: "power3.out",
          clearProps: "filter",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        }
      );
    }, element);

    return () => {
      context.revert();
    };
  }, [direction, duration, delay]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}