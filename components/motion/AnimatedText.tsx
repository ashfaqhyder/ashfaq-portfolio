"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  splitType?: "words" | "chars" | "lines";
}

export default function AnimatedText({
  children,
  className = "",
  delay = 0,
  stagger = 0.05,
  splitType = "words",
}: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const spans = textRef.current.querySelectorAll("span");
    gsap.fromTo(
      spans,
      {
        opacity: 0,
        y: 20,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: stagger,
        delay: delay,
        ease: "power2.out",
      }
    );
  }, [delay, stagger]);

  // Split text into spans
  const renderText = () => {
    const words = children.split(" ");
    return words.map((word, idx) =>
      word.split("").map((char, charIdx) => (
        <span key={`${idx}-${charIdx}`}>{char}</span>
      ))
    );
  };

  return (
    <div ref={textRef} className={className}>
      {splitType === "chars" ? (
        renderText()
      ) : (
        children.split(" ").map((word, idx) => (
          <span key={idx}>
            {word}
            {idx < children.split(" ").length - 1 && " "}
          </span>
        ))
      )}
    </div>
  );
}
