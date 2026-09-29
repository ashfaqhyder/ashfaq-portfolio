"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

interface HoverTiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function HoverTilt({
  children,
  className = "",
  intensity = 0.05,
}: HoverTiltProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = (e.clientY - centerY) * intensity;
    const rotateY = (centerX - e.clientX) * intensity;

    gsap.to(elementRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.3,
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(elementRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
    setIsHovering(false);
  };

  return (
    <div
      ref={elementRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1200px",
      }}
    >
      {children}
    </div>
  );
}
