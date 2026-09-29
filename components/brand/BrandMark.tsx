"use client";

interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <img
      src="/ashfaq-hyder-logo.png"
      alt="Ashfaq Hyder"
      className={`block h-full w-full object-contain ${className}`}
      draggable={false}
    />
  );
}