"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Layers3,
  Palette,
} from "lucide-react";

const capabilities = [
  {
    number: "01",
    title: "Web Development",
    shortTitle: "WEB",
    description:
      "Designing and developing responsive, interactive digital experiences with a focus on clean interfaces, usability and performance.",
    capabilities: [
      "Frontend Development",
      "Full-Stack Applications",
      "Responsive Interfaces",
      "Interactive Experiences",
    ],
    icon: Code2,
  },
  {
    number: "02",
    title: "AI / Machine Learning",
    shortTitle: "AI / ML",
    description:
      "Exploring intelligent systems through machine learning, AI applications, data-driven solutions and prompt engineering.",
    capabilities: [
      "Machine Learning",
      "AI Applications",
      "Prompt Engineering",
      "Data-Driven Solutions",
    ],
    icon: BrainCircuit,
  },
  {
    number: "03",
    title: "Creative Technology",
    shortTitle: "CREATE",
    description:
      "Combining technology and visual thinking to create distinctive digital work across design, multimedia and communication.",
    capabilities: [
      "Graphic Design",
      "Visual Communication",
      "Multimedia",
      "Creative Direction",
    ],
    icon: Palette,
  },
  {
    number: "04",
    title: "Interactive / 3D",
    shortTitle: "3D / UX",
    description:
      "Experimenting with motion, spatial interfaces and immersive interactions to make digital experiences feel more alive.",
    capabilities: [
      "Motion & Animation",
      "3D Experiences",
      "Interactive Interfaces",
      "Experimental Web",
    ],
    icon: Layers3,
  },
];

export default function Capabilities() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section
      id="capabilities"
      className="border-t border-neutral-900 px-6 py-24 md:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-end lg:mb-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
              08 / Capabilities
            </p>

            <p className="mt-6 max-w-xs text-sm leading-6 text-neutral-600">
              Different disciplines, one approach — combining technology,
              intelligence and visual thinking.
            </p>
          </div>

          <div>
            <h2 className="max-w-5xl text-4xl font-medium leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
              What I can
              <br />
              <span className="text-neutral-500">build and create.</span>
            </h2>
          </div>
        </div>

        {/* Capability list */}
        <div className="border-t border-neutral-900">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const isActive = activeIndex === index;

            return (
              <article
                key={capability.number}
                className="group relative border-b border-neutral-900"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className={[
                    "grid gap-8 py-10 transition-all duration-500",
                    "md:grid-cols-[0.12fr_0.58fr_0.3fr] md:items-center",
                    "md:py-14 lg:py-16",
                    isActive ? "lg:pl-3" : "",
                  ].join(" ")}
                >
                  {/* Number */}
                  <div className="flex items-start justify-between md:block">
                    <span
                      className={[
                        "font-mono text-[10px] tracking-widest transition-colors duration-300",
                        isActive
                          ? "text-[var(--portfolio-accent)]"
                          : "text-neutral-700",
                      ].join(" ")}
                    >
                      {capability.number}
                    </span>

                    {/* Mobile icon */}
                    <span className="flex h-9 w-9 items-center justify-center border border-neutral-900 text-neutral-600 md:hidden">
                      <Icon size={16} />
                    </span>
                  </div>

                  {/* Main content */}
                  <div>
                    <div className="mb-4 hidden items-center gap-3 md:flex">
                      <span
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                          isActive
                            ? "border-neutral-700 text-[var(--portfolio-accent)]"
                            : "border-neutral-900 text-neutral-600",
                        ].join(" ")}
                      >
                        <Icon size={16} />
                      </span>

                      <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-700">
                        Capability
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <h3
                        className={[
                          "text-2xl font-medium tracking-tight transition-colors duration-300 md:text-4xl lg:text-5xl",
                          isActive ? "text-white" : "text-neutral-300",
                        ].join(" ")}
                      >
                        {capability.title}
                      </h3>

                      <ArrowUpRight
                        size={20}
                        className={[
                          "shrink-0 transition-all duration-300",
                          isActive
                            ? "translate-x-1 -translate-y-1 text-[var(--portfolio-accent)] opacity-100"
                            : "text-neutral-800 opacity-0",
                        ].join(" ")}
                      />
                    </div>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600 md:text-base">
                      {capability.description}
                    </p>
                  </div>

                  {/* Capability details */}
                  <div className="md:pl-4">
                    <div className="grid grid-cols-1 gap-2">
                      {capability.capabilities.map((item, itemIndex) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-xs text-neutral-600 transition-colors duration-300 group-hover:text-neutral-400"
                        >
                          <span
                            className={[
                              "h-px w-4 transition-all duration-300",
                              isActive
                                ? "bg-[var(--portfolio-accent)]"
                                : "bg-neutral-800",
                            ].join(" ")}
                          />

                          <span>{item}</span>

                          <span className="ml-auto font-mono text-[9px] text-neutral-800">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom interaction line */}
                <span
                  className={[
                    "absolute bottom-0 left-0 h-px bg-[var(--portfolio-accent)] transition-all duration-500",
                    isActive ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </article>
            );
          })}
        </div>

        {/* Closing statement */}
        <div className="mt-16 flex flex-col gap-5 md:mt-20 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-sm leading-7 text-neutral-600">
            I approach each project as an opportunity to combine different
            disciplines rather than staying inside a single category.
          </p>

          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-700">
            CODE × DESIGN × INTELLIGENCE
          </span>
        </div>
      </div>
    </section>
  );
}