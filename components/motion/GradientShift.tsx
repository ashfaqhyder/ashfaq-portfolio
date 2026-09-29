"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GradientShiftProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  colors?: string[];
}

export default function GradientShift({
  children,
  className = "",
  duration = 8,
  colors = [
    "from-blue-500",
    "from-purple-500",
    "from-pink-500",
    "from-blue-500",
  ],
}: GradientShiftProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const timeline = gsap.timeline({ repeat: -1 });

    // Create a smooth color shift effect
    const keyframes = colors.map((_, i) => ({
      duration: duration / colors.length,
      color: `hsl(${(i * 360) / colors.length}, 100%, 50%)`,
    }));

    timeline.to(elementRef.current, {
      background: colors.map((c) => c).join(" → "),
      duration: duration,
      ease: "none",
      repeat: -1,
    });

    return () => {
      timeline.kill();
    };
  }, [duration, colors]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
