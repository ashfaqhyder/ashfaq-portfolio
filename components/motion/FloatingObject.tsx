"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface FloatingObjectProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  intensity?: number;
}

export default function FloatingObject({
  children,
  className = "",
  duration = 3,
  intensity = 20,
}: FloatingObjectProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    timeline
      .to(
        elementRef.current,
        {
          y: intensity,
          duration: duration / 2,
          ease: "sine.inOut",
        },
        0
      )
      .to(
        elementRef.current,
        {
          rotationZ: 2,
          duration: duration,
          ease: "sine.inOut",
        },
        0
      );

    return () => {
      timeline.kill();
    };
  }, [duration, intensity]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
