"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";

import {
  getPublishedSkills,
  Skill,
  skillGroups,
  SkillGroup,
} from "@/services/skills";

import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlask,
  SiGit,
  SiGithub,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";

import {
  BrainCircuit,
  Code2,
  Database,
  Globe,
  Languages,
  Layers3,
  Palette,
  Terminal,
  Wrench,
} from "lucide-react";

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
}>;

const groupDescriptions: Record<SkillGroup, string> = {
  Programming:
    "Languages and programming foundations used to build software and solve problems.",
  "Web Development":
    "Technologies used to create responsive, functional and interactive web experiences.",
  "AI / ML":
    "Artificial intelligence, machine learning and intelligent application development.",
  "Cloud / Backend":
    "Backend systems, databases, cloud platforms and application infrastructure.",
  "Creative / Multimedia":
    "Visual design, multimedia, motion and creative technology.",
  Tools:
    "Development and technical tools used across projects and workflows.",
  "Soft Skills":
    "The ways I collaborate, communicate, think and work with others.",
  Languages:
    "Human languages used for communication and collaboration.",
};

const skillIcons: Record<string, IconComponent> = {
  C: SiC,
  "C++": SiCplusplus,
  CSS: SiCss,
  Docker: SiDocker,
  Express: SiExpress,
  Figma: SiFigma,
  Firebase: SiFirebase,
  Flask: SiFlask,
  Git: SiGit,
  GitHub: SiGithub,
  "Google Cloud": SiGooglecloud,
  HTML: SiHtml5,
  HTML5: SiHtml5,
  JavaScript: SiJavascript,
  MongoDB: SiMongodb,
  MySQL: SiMysql,
  "Next.js": SiNextdotjs,
  Node: SiNodedotjs,
  "Node.js": SiNodedotjs,
  NumPy: SiNumpy,
  Pandas: SiPandas,
  PostgreSQL: SiPostgresql,
  Python: SiPython,
  PyTorch: SiPytorch,
  React: SiReact,
  "scikit-learn": SiScikitlearn,
  Streamlit: SiStreamlit,
  Tailwind: SiTailwindcss,
  "Tailwind CSS": SiTailwindcss,
  TensorFlow: SiTensorflow,
  TypeScript: SiTypescript,
};

const groupIcons: Record<SkillGroup, IconComponent> = {
  Programming: Terminal,
  "Web Development": Globe,
  "AI / ML": BrainCircuit,
  "Cloud / Backend": Database,
  "Creative / Multimedia": Palette,
  Tools: Wrench,
  "Soft Skills": Code2,
  Languages: Languages,
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOut(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(value: number) {
  const t = clamp(value);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function range(value: number, start: number, end: number) {
  return clamp((value - start) / Math.max(end - start, 0.0001));
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * clamp(progress);
}

function wrapIndex(index: number, length: number) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function shortestOffset(index: number, rotation: number, length: number) {
  let offset = index - rotation;

  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;

  return offset;
}

/**
 * Same character-by-character treatment used by Recognition / Projects:
 * accent colour -> main text colour.
 */
function SectionHeading({
  progress,
}: {
  progress: number;
}) {
  const text = "Tools, technologies and ways of thinking.";

  return (
    <h2
      aria-label={text}
      className="max-w-[1000px] font-[Syne,sans-serif] text-[clamp(2rem,8vw,3.4rem)] font-medium leading-[0.92] tracking-[-0.065em] sm:text-[clamp(2.6rem,6vw,6.8rem)]"
    >
      {Array.from(text).map((character, index) => {
        const count = text.length;
        const start = index / count;
        const end = (index + 1) / count;
        const local = clamp(
          (progress - start) / Math.max(end - start, 0.001)
        );
        const reveal = easeOut(local);

        return (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            style={{
              display: "inline-block",
              color:
                reveal > 0.5
                  ? "var(--portfolio-text)"
                  : "var(--portfolio-accent)",
              opacity: 0.08 + reveal * 0.92,
              transform: `translate3d(0, ${(1 - reveal) * 10}px, 0)`,
              filter: `blur(${(1 - reveal) * 1.6}px)`,
              transition:
                "color 600ms cubic-bezier(0.16,1,0.3,1), opacity 450ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        );
      })}
    </h2>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[8px] uppercase tracking-[0.2em]"
        style={{ color: "var(--portfolio-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-xs leading-5"
        style={{ color: "var(--portfolio-text)" }}
      >
        {value}
      </p>
    </div>
  );
}

function SkillDetailCard({
  skill,
  index,
  total,
}: {
  skill: Skill;
  index: number;
  total: number;
}) {
  const Icon = skillIcons[skill.name] ?? Code2;

  return (
    <article
      className="relative min-h-[15rem] w-full max-w-[21rem] overflow-hidden rounded-[1.45rem] border p-4 sm:min-h-[21rem] sm:p-5 md:min-h-[22rem] md:p-6"
      style={{
        background: "var(--portfolio-background)",
        color: "var(--portfolio-text)",
        borderColor: "var(--portfolio-border)",
        boxShadow:
          "0 35px 90px color-mix(in srgb, var(--portfolio-text) 7%, transparent)",
      }}
    >
      <div
        className="absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl"
        style={{
          background: "var(--portfolio-accent)",
          opacity: 0.035,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className="font-mono text-[8px] uppercase tracking-[0.24em]"
          style={{ color: "var(--portfolio-muted)" }}
        >
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(
            skill.name
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${skill.name} on Wikipedia`}
          title={`Open ${skill.name} on Wikipedia`}
          className="relative z-50 grid size-16 shrink-0 cursor-pointer place-items-center rounded-full border outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 md:size-20"
          style={{
            borderColor: "var(--portfolio-border)",
            color: "var(--portfolio-accent)",
            boxShadow:
              "0 0 50px color-mix(in srgb, var(--portfolio-accent) 10%, transparent)",
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <span
            key={skill.name}
            className="grid place-items-center"
            style={{
              animation:
                "skills-icon-change 700ms cubic-bezier(.16,1,.3,1)",
            }}
          >
            <Icon size={34} className="md:hidden" />
            <Icon size={42} className="hidden md:block" />
          </span>
        </a>
      </div>

      <div className="relative mt-4 flex min-h-[4rem] flex-1 flex-col justify-center sm:mt-12 sm:min-h-[8rem]">
        <p
          className="mb-3 font-mono text-[8px] uppercase tracking-[0.24em]"
          style={{ color: "var(--portfolio-muted)" }}
        >
          {skill.group}
        </p>

        <h3
          className="max-w-full break-words font-[Syne,sans-serif] font-medium leading-[0.94] tracking-[-0.055em]"
          style={{
            fontSize:
              skill.name.length > 26
                ? "clamp(1.65rem, 3vw, 2.35rem)"
                : skill.name.length > 18
                  ? "clamp(1.85rem, 3.3vw, 2.7rem)"
                  : "clamp(2rem, 4vw, 3.25rem)",
          }}
        >
          {skill.name}
        </h3>
      </div>

      <div className="relative mt-auto pt-5">
        <div
          className="border-t pt-4"
          style={{ borderColor: "var(--portfolio-border)" }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {skill.proficiency && (
              <MetadataRow
                label="Proficiency"
                value={skill.proficiency}
              />
            )}

            {skill.yearsOfExperience !== undefined && (
              <MetadataRow
                label="Experience"
                value={`${skill.yearsOfExperience} ${
                  skill.yearsOfExperience === 1 ? "year" : "years"
                }`}
              />
            )}
          </div>

          {skill.learningContext &&
            skill.learningContext.length > 0 && (
              <div className="mt-4">
                <MetadataRow
                  label="Learning context"
                  value={skill.learningContext.join(" · ")}
                />
              </div>
            )}
        </div>
      </div>
    </article>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const dragOriginRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
  });
  const previousDragRef = useRef(0);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const pendingSkillRef = useRef<number | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [wheelAnimating, setWheelAnimating] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        const data = await getPublishedSkills();

        if (active) {
          setSkills(data);
        }
      } catch (error) {
        console.error("Failed to load published skills:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      active = false;
    };
  }, []);

  const orderedSkills = useMemo(() => {
    return skillGroups.flatMap((group) =>
      skills
        .filter((skill) => skill.group === group)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    );
  }, [skills]);

  /*
   * The whole section behaves as a scroll-driven page:
   *
   * INTRO     0.00 -> 0.22
   * WHEEL     0.18 -> 0.84
   * OUTRO     0.84 -> 1.00
   */
  useEffect(() => {
    let raf = 0;

    const update = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(
        section.offsetHeight - window.innerHeight,
        1
      );

      setScrollProgress(
        clamp(-rect.top / distance)
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /*
   * Map page scroll onto the wheel carousel.
   * This keeps the wheel interaction visually identical to
   * the uploaded carousel while making the section behave
   * like Projects / Recognition.
   */
  useEffect(() => {
    if (
      draggingRef.current ||
      orderedSkills.length === 0
    ) {
      return;
    }

    const carouselProgress = easeInOut(
      range(scrollProgress, 0.2, 0.84)
    );

    // Treat the wheel as a continuous circular carousel.
    // One full scroll span advances exactly one complete cycle,
    // so the last skill never has to be forced into a terminal
    // "front" position.
    const nextRotation =
      carouselProgress * orderedSkills.length;

    setRotation(nextRotation);

    const nextIndex = wrapIndex(
      Math.round(nextRotation),
      orderedSkills.length
    );

    setSelectedIndex(nextIndex);
  }, [orderedSkills.length, scrollProgress]);

  const introProgress = easeOut(
    range(scrollProgress, 0.03, 0.22)
  );

  const headingProgress = easeOut(
    range(scrollProgress, 0.08, 0.42)
  );

  const wheelProgress = easeInOut(
    range(scrollProgress, 0.16, 0.86)
  );

  const outroProgress = easeInOut(
    range(scrollProgress, 0.82, 1)
  );

  const introOpacity = 1;

  const wheelOpacity =
    easeOut(range(scrollProgress, 0.15, 0.25)) *
    (1 - easeInOut(range(scrollProgress, 0.87, 0.98)));

  const wheelY = lerp(
    90,
    0,
    easeOut(range(scrollProgress, 0.15, 0.3))
  );

  const wheelScale = lerp(
    0.94,
    1,
    easeOut(range(scrollProgress, 0.15, 0.3))
  );

  const activeSkill =
    orderedSkills[
      wrapIndex(selectedIndex, orderedSkills.length)
    ];

  const activeIcon = activeSkill
    ? skillIcons[activeSkill.name] ?? Code2
    : Code2;

  const sectionIntroText =
    "A growing toolkit shaped by projects, experimentation, internships and continuous learning.";

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!event.isPrimary || event.button !== 0) return;

    dragMovedRef.current = false;

    const target = event.target as HTMLElement | null;
    const skillButton = target?.closest<HTMLElement>(
      "[data-skill-index]"
    );

    pendingSkillRef.current = skillButton
      ? Number(skillButton.dataset.skillIndex)
      : null;

    draggingRef.current = true;
    setDragging(true);

    dragOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotation,
    };

    previousDragRef.current = rotation;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in every browser/context.
    }
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current || orderedSkills.length === 0) {
      return;
    }

    const deltaX = event.clientX - dragOriginRef.current.x;
    const deltaY = event.clientY - dragOriginRef.current.y;

    // Allow either vertical wheel dragging or horizontal dragging.
    // The larger movement axis determines the direction.
    const distance =
      Math.abs(deltaY) >= Math.abs(deltaX)
        ? deltaY
        : -deltaX;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      dragMovedRef.current = true;
      pendingSkillRef.current = null;
    }

    const nextRotation =
      dragOriginRef.current.rotation -
      distance * 0.024;

    previousDragRef.current = nextRotation;
    setRotation(nextRotation);

    const nextIndex = wrapIndex(
      Math.round(nextRotation),
      orderedSkills.length
    );

    setSelectedIndex(nextIndex);
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setDragging(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    const pendingSkill = pendingSkillRef.current;
    pendingSkillRef.current = null;

    if (
      !dragMovedRef.current &&
      pendingSkill !== null &&
      Number.isFinite(pendingSkill)
    ) {
      spinToSkill(pendingSkill);
      return;
    }

    const target = Math.round(rotation);

    setRotation(target);
    setSelectedIndex(
      wrapIndex(target, orderedSkills.length)
    );
  };

  const spinToSkill = (targetIndex: number) => {
    if (!orderedSkills.length) return;

    const length = orderedSkills.length;
    const normalizedTarget = wrapIndex(
      targetIndex,
      length
    );

    // Pick the nearest equivalent position on the circular wheel.
    let target = normalizedTarget;
    const current = rotation;
    const delta = normalizedTarget - wrapIndex(
      Math.round(current),
      length
    );

    if (delta > length / 2) {
      target -= length;
    } else if (delta < -length / 2) {
      target += length;
    }

    // Preserve the current cycle while moving only as far as needed.
    const currentCycle = Math.round(current / length) * length;
    target += currentCycle;

    setWheelAnimating(true);
    setRotation(target);
    setSelectedIndex(normalizedTarget);

    window.setTimeout(() => {
      setWheelAnimating(false);
    }, 750);
  };

  const moveBy = (amount: number) => {
    if (!orderedSkills.length) return;

    const target = clamp(
      Math.round(rotation) + amount,
      0,
      orderedSkills.length - 1
    );

    spinToSkill(target);
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: "350svh",
        background: "transparent",
        color: "var(--portfolio-text)",
      }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          background: "transparent",
        }}
      >
        {/* SUBTLE ATMOSPHERE */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-1/2 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{
              background: "var(--portfolio-accent)",
              opacity: 0.018,
            }}
          />
        </div>

        {/* =================================================
            PERSISTENT EYEBROW
        ================================================= */}
        <div className="absolute left-6 top-20 z-50 flex items-center gap-3 md:left-10 lg:left-16 lg:top-24">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--portfolio-accent)",
            }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{
              color: "var(--portfolio-muted)",
            }}
          >
             / Tools &amp; techniques
          </span>
        </div>

        {/* =================================================
            INTRO / HEADING
        ================================================= */}
        <div
          className="absolute inset-x-0 top-0 z-30 pointer-events-none px-6 pt-32 md:px-10 lg:px-16 lg:pt-24"
          style={{
            opacity: 1,
            transform: `translate3d(0, ${
              lerp(30, 0, introProgress)
            }px, 0)`,
            pointerEvents: "none",
            transition:
              "transform 800ms cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div className="mx-auto flex max-w-[1650px] justify-start md:justify-end">
            <div className="w-full max-w-full md:max-w-[48%] md:pl-8 lg:max-w-[44%] lg:pl-6">
              <div className="mb-3 font-[Syne,sans-serif] text-3xl font-medium tracking-[-0.06em] md:hidden">Skills<span style={{ color: "var(--portfolio-accent)" }}>.</span></div>
              <div className="hidden md:block">
                <SectionHeading progress={headingProgress} />
              </div>

              <p
                className="mt-3 hidden max-w-md font-[Manrope,sans-serif] text-sm leading-7 md:mt-7 md:block"
                style={{
                  color: "var(--portfolio-muted)",
                  opacity: easeOut(
                    range(scrollProgress, 0.16, 0.3)
                  ),
                }}
              >
                {sectionIntroText}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            WHEEL CAROUSEL PAGE
        ================================================= */}
        <div
          className="absolute inset-0 z-40"
          style={{
            opacity: wheelOpacity,
            transform: `translate3d(0, ${wheelY}px, 0) scale(${wheelScale})`,
            pointerEvents:
              wheelOpacity > 0.35 ? "auto" : "none",
            transition:
              "opacity 650ms cubic-bezier(.16,1,.3,1), transform 900ms cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div className="relative mx-auto flex h-full max-w-[1500px] items-start px-4 pt-[25vh] sm:items-center sm:px-6 sm:pt-24 md:px-10 lg:px-16 lg:pt-24">
            <div className="relative grid w-full grid-cols-1 items-start gap-2 sm:gap-3 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-8">
              {/* ACTIVE DETAIL CARD */}
              <div
                className="relative z-50 flex w-full justify-start lg:justify-start lg:pr-6"
                style={{
                  opacity: easeOut(
                    range(scrollProgress, 0.21, 0.34)
                  ),
                  transform: `translate3d(0, ${
                    lerp(
                      35,
                      0,
                      easeOut(
                        range(
                          scrollProgress,
                          0.21,
                          0.34
                        )
                      )
                    )
                  }px, 0)`,
                }}
              >
                {loading ? (
                  <div
                    className="flex h-[25rem] w-full max-w-[25rem] items-center justify-center rounded-[1.55rem] border"
                    style={{
                      borderColor:
                        "var(--portfolio-border)",
                      color: "var(--portfolio-muted)",
                    }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em]">
                      Loading tools
                    </span>
                  </div>
                ) : activeSkill ? (
                  <div
                    key={activeSkill.id ?? activeSkill.name}
                    className="h-[21rem] w-full max-w-[21rem] md:h-auto md:max-w-[21rem]"
                    style={{
                      animation:
                        "skills-card-in 600ms cubic-bezier(.16,1,.3,1)",
                    }}
                  >
                    <SkillDetailCard
                      skill={activeSkill}
                      index={selectedIndex}
                      total={orderedSkills.length}
                    />

                    <div className="mt-5 hidden items-center gap-3 md:flex">
                      <span
                        className="font-mono text-[8px] uppercase tracking-[0.2em]"
                        style={{
                          color:
                            "var(--portfolio-muted)",
                        }}
                      >
                        Drag or scroll through the wheel
                      </span>

                      <span
                        className="h-px w-8"
                        style={{
                          background:
                            "var(--portfolio-border)",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-sm"
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    Skills coming soon.
                  </div>
                )}
              </div>

              {/* WHEEL */}
              <div
                className="relative order-last z-[60] mx-auto mt-5 h-[4.5rem] w-full max-w-[21rem] select-none overflow-hidden touch-none bg-transparent sm:mt-2 sm:h-[8rem] sm:max-w-[21rem] md:relative md:order-none md:bottom-auto md:left-auto md:mx-0 md:mt-0 md:h-[25rem] md:max-w-[29rem] md:-ml-64 lg:-ml-64 lg:h-[31rem]"
                style={{
                  touchAction: "none",
                  cursor: dragging ? "grabbing" : "grab",
                }}
                role="listbox"
                aria-label="Skills wheel carousel"
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onKeyDown={(event) => {
                  if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowRight"
                  ) {
                    event.preventDefault();
                    moveBy(1);
                  }

                  if (
                    event.key === "ArrowUp" ||
                    event.key === "ArrowLeft"
                  ) {
                    event.preventDefault();
                    moveBy(-1);
                  }

                  if (event.key === "Home") {
                    event.preventDefault();
                    setRotation(0);
                    setSelectedIndex(0);
                  }

                  if (event.key === "End") {
                    event.preventDefault();
                    const last =
                      orderedSkills.length - 1;
                    setRotation(last);
                    setSelectedIndex(last);
                  }
                }}
              >
                {/* ACTIVE MARKER */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[3%] top-1/2 z-20 -translate-x-full -translate-y-1/2 rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    background:
                      "var(--portfolio-accent)",
                    boxShadow:
                      "0 0 28px color-mix(in srgb, var(--portfolio-accent) 45%, transparent)",
                  }}
                />

                {orderedSkills.map(
                  (skill, index) => {
                    const offset = shortestOffset(
                      index,
                      rotation,
                      orderedSkills.length
                    );

                    if (Math.abs(offset) > 2.5) {
                      return null;
                    }

                    /*
                     * Geometry mirrors the uploaded wheel carousel:
                     * x bends inward, y follows a curved vertical path,
                     * and rotation follows the wheel tangent.
                     */
                    const isMobileWheel = typeof window !== "undefined" && window.innerWidth < 768;
                    const radius = isMobileWheel ? 0 : 365;
                    const spacing = isMobileWheel ? 0 : 14;
                    const angle =
                      offset * spacing;
                    const radians =
                      (angle * Math.PI) / 180;

                    const x = isMobileWheel ? offset * Math.min(94, window.innerWidth * 0.24) : -radius * (1 - Math.cos(radians));
                    const y = isMobileWheel ? 0 : radius * Math.sin(radians);

                    const distance = Math.min(
                      Math.abs(offset) / 2.5,
                      1
                    );

                    const opacity = Math.cos(
                      (distance * Math.PI) / 2
                    );

                    const scale =
                      1 -
                      Math.min(
                        Math.abs(offset) * 0.04,
                        0.35
                      );

                    const selected =
                      Math.abs(offset) < 0.5;

                    const Icon =
                      skillIcons[skill.name] ??
                      Code2;

                    return (
                      <button
                        key={
                          skill.id ??
                          `${skill.name}-${index}`
                        }
                        type="button"
                        role="option"
                        aria-selected={selected}
                        aria-label={`Select ${skill.name}`}
                        data-skill-index={index}
                        onClick={(event) => {
                          // Pointer capture on the wheel handles selection
                          // on pointer-up. Prevent the native click from
                          // causing a second navigation/selection.
                          event.preventDefault();
                        }}
                        className="absolute left-1/2 top-1/2 origin-left whitespace-nowrap text-left outline-none md:left-[15%]"
                        style={{
                          color: selected
                            ? "var(--portfolio-text)"
                            : "var(--portfolio-muted)",
                          opacity,
                          transform: `translate(${isMobileWheel ? "-50%" : "0"}, ${y}px) translate(${x}px, -50%) rotate(${isMobileWheel ? 0 : angle}deg) scale(${isMobileWheel ? 0.78 : scale})`,
                          zIndex:
                            100 -
                            Math.round(
                              Math.abs(offset) * 10
                            ),
                          transition:
                            wheelAnimating
                              ? "transform 750ms cubic-bezier(.16,1,.3,1), color 350ms ease, opacity 500ms ease, filter 500ms ease"
                              : "transform 650ms cubic-bezier(.16,1,.3,1), color 350ms ease, opacity 500ms ease, filter 500ms ease",
                        }}
                      >
                        <span
                          className="flex items-center gap-4"
                          style={{
                            filter: selected
                              ? "none"
                              : `blur(${Math.min(
                                  1.5,
                                  Math.abs(offset) * 0.35
                                )}px)`,
                          }}
                        >
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-full border"
                            style={{
                              borderColor: selected
                                ? "var(--portfolio-accent)"
                                : "var(--portfolio-border)",
                              color: selected
                                ? "var(--portfolio-accent)"
                                : "var(--portfolio-muted)",
                              background:
                                "var(--portfolio-background)",
                            }}
                          >
                            <Icon size={17} />
                          </span>

                          <span
                            className="hidden font-[Manrope,sans-serif] text-[clamp(1rem,2.3vw,1.55rem)] font-medium tracking-[-0.02em] md:inline"
                            style={{
                              color: selected
                                ? "var(--portfolio-text)"
                                : "var(--portfolio-muted)",
                            }}
                          >
                            {skill.name}
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}

                {/* EDGE FADES REMOVED — keep the wheel completely transparent
                    over the heading area. */}
              </div>
              <div className="mt-2 text-center font-[Manrope,sans-serif] text-xs font-medium md:hidden" style={{ color: "var(--portfolio-text)" }}>
                {activeSkill?.name ?? "Select a skill"}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            OUTRO
        ================================================= */}
        <div
          className="pointer-events-none absolute inset-0 z-40 flex items-end px-6 pb-10 md:px-10 lg:px-16 lg:pb-14"
          style={{
            opacity: outroProgress,
            transform: `translate3d(0, ${
              lerp(30, 0, outroProgress)
            }px, 0)`,
          }}
        >
          <div className="mx-auto flex w-full max-w-[1650px] items-end justify-between gap-8">
            <p
              className="max-w-md font-[Manrope,sans-serif] text-sm leading-7"
              style={{
                color: "var(--portfolio-muted)",
              }}
            >
              Different tools, one approach — combining
              technology, intelligence and visual thinking
              to build purposeful experiences.
            </p>

            <span
              className="hidden font-mono text-[9px] uppercase tracking-[0.24em] md:block"
              style={{
                color: "var(--portfolio-muted)",
              }}
            >
              CODE × DESIGN × INTELLIGENCE
            </span>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div
          className="absolute bottom-8 right-6 z-50 hidden md:block lg:right-16"
          style={{
            opacity: wheelProgress,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{
                color: "var(--portfolio-muted)",
              }}
            >
              {activeSkill?.name ?? "Skills"}
            </span>

            <span
              className="h-px w-12"
              style={{
                background:
                  "var(--portfolio-border)",
              }}
            />

            <span
              className="font-mono text-[8px]"
              style={{
                color: "var(--portfolio-muted)",
              }}
            >
              {orderedSkills.length
                ? `${String(
                    selectedIndex + 1
                  ).padStart(2, "0")} / ${String(
                    orderedSkills.length
                  ).padStart(2, "0")}`
                : "-- / --"}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes skills-card-in {
          from {
            opacity: 0;
            transform: translate3d(18px, 0, 0) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes skills-icon-change {
          from {
            opacity: 0;
            transform: scale(0.7) rotate(-10deg);
          }

          55% {
            opacity: 1;
            transform: scale(1.08) rotate(3deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
          }

          .skills-card-in {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
