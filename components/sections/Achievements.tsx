"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  Achievement,
  getPublishedAchievements,
} from "@/services/achievements";

const clamp = (
  value: number,
  min = 0,
  max = 1
) =>
  Math.min(
    max,
    Math.max(min, value)
  );

const easeOut = (value: number) =>
  1 - Math.pow(1 - clamp(value), 3);

const easeInOut = (value: number) => {
  const t = clamp(value);

  return t < 0.5
    ? 4 * t * t * t
    : 1 -
        Math.pow(
          -2 * t + 2,
          3
        ) /
          2;
};

type AchievementRecord = Achievement & Record<string, unknown>;

const asAchievementRecord = (value: unknown) =>
  value as AchievementRecord;

const getNestedAchievements = (achievement: Achievement) => {
  const record = asAchievementRecord(achievement);
  const candidates = [
    record.children,
    record.subCertificates,
    record.subcertificates,
    record.subAchievements,
    record.subachievements,
    record.courses,
    record.certificates,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Achievement =>
          Boolean(item) && typeof item === "object"
      );
    }
  }

  return [];
};

const getParentReference = (achievement: Achievement) => {
  const record = asAchievementRecord(achievement);
  const value =
    record.parentId ??
    record.parentAchievementId ??
    record.masterId ??
    record.masterCertificateId ??
    record.parentCertificateId;

  return typeof value === "string" ? value : null;
};

const getAchievementId = (achievement: Achievement, index: number) =>
  achievement.id ?? `achievement-${index}-${achievement.title}`;

function RecognitionHeading({
  progress,
}: {
  progress: number;
}) {
  const text =
    "Certifications & milestones.";

  return (
    <h2
      aria-label={text}
      className="max-w-[900px] font-[Syne,sans-serif] text-[clamp(2.1rem,4.2vw,4.4rem)] font-medium leading-[0.9] tracking-[-0.065em]"
    >
      {Array.from(text).map(
        (character, index) => {
          const start =
            index / text.length;

          const end =
            (index + 1) /
            text.length;

          const local = clamp(
            (progress - start) /
              Math.max(
                end - start,
                0.001
              )
          );

          const reveal =
            easeOut(local);

          return (
            <span
              key={`${character}-${index}`}
              aria-hidden="true"
              style={{
                display:
                  "inline-block",
                color:
                  reveal > 0.5
                    ? "var(--portfolio-text)"
                    : "var(--portfolio-accent)",
                opacity:
                  0.08 +
                  reveal * 0.92,
                transform: `translate3d(0,${
                  (1 - reveal) *
                  10
                }px,0)`,
                filter: `blur(${
                  (1 - reveal) *
                  1.6
                }px)`,
              }}
            >
              {character === " "
                ? "\u00A0"
                : character}
            </span>
          );
        }
      )}
    </h2>
  );
}

function CardFront({
  achievement,
}: {
  achievement: Achievement;
}) {
  const [
    logoError,
    setLogoError,
  ] = useState(false);

  const hasLogo =
    Boolean(
      achievement.organizationLogoUrl
    ) && !logoError;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.45rem] border p-5 md:p-6"
      style={{
        backgroundColor:
          "var(--portfolio-background)",
        color:
          "var(--portfolio-text)",
        borderColor:
          "var(--portfolio-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="font-mono text-[8px] uppercase tracking-[0.18em]"
          style={{
            color:
              "var(--portfolio-muted)",
          }}
        >
          {(() => {
            const title = achievement.title.toLowerCase();
            const explicitType = String(
              (achievement as Achievement & { recognitionType?: string; type?: string }).recognitionType ??
              (achievement as Achievement & { type?: string }).type ??
              ""
            ).toLowerCase();

            if (explicitType.includes("hack")) return "Hackathon";
            if (explicitType.includes("cert")) return "Certification";
            if (explicitType.includes("course")) return "Course";
            if (explicitType.includes("award")) return "Award";
            if (explicitType.includes("competition")) return "Competition";
            if (/hackathon|hack street|hackfest/.test(title)) return "Hackathon";
            if (/certificat|certified|credential/.test(title)) return "Certification";
            if (/course|training|foundations|introduction to|essentials/.test(title)) return "Certification";
            if (/exam|assessment|aptitude/.test(title)) return "Assessment";
            return achievement.structure === "master" ? "Certification" : "Recognition";
          })()}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border"
            style={{
              borderColor:
                "var(--portfolio-border)",
            }}
          >
            {hasLogo ? (
              <img
                src={
                  achievement.organizationLogoUrl
                }
                alt={`${achievement.organization} logo`}
                className="h-full w-full object-contain p-1"
                onError={() =>
                  setLogoError(true)
                }
              />
            ) : (
              <span className="font-mono text-[7px]">
                {achievement.organization
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 md:inset-x-6">
        <p
          className="mb-2 font-mono text-[9px] uppercase leading-[1.2] tracking-[0.1em]"
          style={{ color: "var(--portfolio-muted)" }}
          title={achievement.organization}
        >
          {achievement.organization}
        </p>
        <h3 className="font-[Syne,sans-serif] text-[clamp(1.05rem,1.75vw,1.5rem)] font-medium leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          {achievement.title}
        </h3>
      </div>

      <div className="mt-auto">
        <div
          className="border-t pt-3"
          style={{
            borderColor:
              "var(--portfolio-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[7px] uppercase tracking-[0.14em]"
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              {achievement.date}
            </span>

            <span
              className="grid size-7 place-items-center rounded-full border"
              style={{
                borderColor:
                  "var(--portfolio-border)",
              }}
            >
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({
  achievement,
}: {
  achievement: Achievement;
}) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[1.45rem] border p-5 md:p-6"
      style={{
        backgroundColor:
          "var(--portfolio-text)",
        color:
          "var(--portfolio-background)",
        borderColor:
          "var(--portfolio-text)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[7px] uppercase tracking-[0.22em] opacity-50">
          Details
        </span>

        <span className="grid size-8 place-items-center rounded-full border border-current">
          <ArrowUpRight className="size-3" />
        </span>
      </div>

      <div className="recognition-card-scroll mt-5 min-h-0 flex-1 overflow-y-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-75">
          {achievement.organization}
        </p>

        <h3 className="mt-3 font-[Syne,sans-serif] text-[clamp(1.05rem,1.75vw,1.5rem)] font-medium leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          {achievement.title}
        </h3>

        {achievement.description && (
          <p className="mt-5 font-[Manrope,sans-serif] text-xs leading-6 opacity-70">
            {achievement.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex shrink-0 items-end justify-between gap-3 border-t border-current pt-4">
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.16em] opacity-40">
            Awarded
          </p>

          <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em]">
            {achievement.date}
          </p>
        </div>

        {achievement.verificationUrl && (
          <a
            href={
              achievement.verificationUrl
            }
            target="_blank"
            rel="noreferrer"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.13em] transition-opacity duration-300 hover:opacity-50"
          >
            Verify
            <ExternalLink className="size-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function CardFace({
  achievement,
  flipped,
}: {
  achievement: Achievement;
  flipped: boolean;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        transformStyle:
          "preserve-3d",
        transform: flipped
          ? "rotateY(180deg)"
          : "rotateY(0deg)",
        transition:
          "transform 760ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility:
            "hidden",
        }}
      >
        <CardFront
          achievement={
            achievement
          }
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility:
            "hidden",
          transform:
            "rotateY(180deg)",
        }}
      >
        <CardBack
          achievement={
            achievement
          }
        />
      </div>
    </div>
  );
}

function getRestingPosition(
  index: number,
  total: number
) {
  if (total <= 1) {
    return {
      x: 0,
      y: 0,
      rotate: 0,
    };
  }

  if (total === 2) {
    return index === 0
      ? {
          x: -7,
          y: 0,
          rotate: -1,
        }
      : {
          x: 7,
          y: 5,
          rotate: 1,
        };
  }

  const positions = [
    {
      x: 0,
      y: 0,
      rotate: 0,
    },
    {
      x: -9,
      y: 7,
      rotate: -2,
    },
    {
      x: 9,
      y: 14,
      rotate: 2,
    },
    {
      x: -16,
      y: 20,
      rotate: -4,
    },
    {
      x: 16,
      y: 26,
      rotate: 4,
    },
    {
      x: -22,
      y: 32,
      rotate: -5,
    },
    {
      x: 22,
      y: 38,
      rotate: 5,
    },
  ];

  return (
    positions[
      Math.min(
        index,
        positions.length - 1
      )
    ] ?? positions[0]
  );
}

function getExpandedPosition(
  index: number,
  total: number,
  spacing: number
) {
  const center =
    (total - 1) / 2;

  const offset =
    index - center;

  return {
    x:
      offset * spacing,
    y:
      Math.abs(offset) * 13,
    rotate:
      offset * 4,
  };
}

function RecognitionCard({
  achievement,
  index,
  total,
  hovered,
  flipped,
  selected,
  visible,
  expansion,
  outro,
  onHover,
  onClick,
  focused,
}: {
  achievement: Achievement;
  index: number;
  total: number;
  hovered: boolean;
  flipped: boolean;
  selected: boolean;
  visible: boolean;
  expansion: number;
  outro: number;
  onHover: (value: boolean) => void;
  onClick: () => void;
  focused?: boolean;
}) {
  const resting =
    getRestingPosition(
      index,
      total
    );

  const expanded =
    getExpandedPosition(
      index,
      total,
      total > 5 ? 125 : 150
    );

  const x =
    resting.x +
    (expanded.x -
      resting.x) *
      expansion;

  const y =
    resting.y +
    (expanded.y -
      resting.y) *
      expansion;

  const rotation =
    resting.rotate +
    (expanded.rotate -
      resting.rotate) *
      expansion;

  const finalX =
    x * (1 - outro);

  const finalY =
    y * (1 - outro);

  const finalRotation =
    rotation * (1 - outro);

  const scale =
    flipped && selected
      ? 1.08
      : hovered
        ? 1.045
        : selected
          ? 1.02
          : 1;

  const zIndex = focused
    ? 1400
    : hovered
      ? 950
      : selected
        ? 1000
        : 300 - index;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() =>
        onHover(true)
      }
      onMouseLeave={() =>
        onHover(false)
      }
      onFocus={() =>
        onHover(true)
      }
      onBlur={() =>
        onHover(false)
      }
      className="absolute left-1/2 top-1/2 h-[300px] w-[200px] md:h-[325px] md:w-[215px]"
      style={{
        zIndex,
        opacity: visible
          ? 1 -
            outro * 0.2
          : 0,
        pointerEvents:
          visible
            ? "auto"
            : "none",
        perspective:
          "1800px",
        transform: `translate3d(calc(-50% + ${finalX}px),calc(-50% + ${finalY}px),0) rotate(${finalRotation}deg) scale(${scale})`,
        transition:
          "transform 760ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease, filter 400ms ease",
        filter:
          hovered || flipped
            ? "drop-shadow(0 28px 42px rgba(0,0,0,0.22))"
            : "none",
      }}
    >
      <CardFace
        achievement={
          achievement
        }
        flipped={flipped}
      />
    </button>
  );
}

function getSubcardPosition(
  index: number,
  total: number,
  expanded: number
) {
  const side =
    index % 2 === 0 ? -1 : 1;

  const sideIndex =
    Math.floor(index / 2);

  const distance =
    235 +
    sideIndex * 175;

  const restingDistance =
    34 +
    sideIndex * 9;

  const restingX =
    side * restingDistance;

  const expandedX =
    side * distance;

  const restingY =
    8 +
    sideIndex * 8;

  const expandedY =
    sideIndex * 18;

  const restingRotate =
    side *
    (sideIndex === 0
      ? 1.5
      : 3 + sideIndex);

  const expandedRotate =
    side *
    (4 + sideIndex * 1.5);

  return {
    x:
      restingX +
      (expandedX -
        restingX) *
        expanded,
    y:
      restingY +
      (expandedY -
        restingY) *
        expanded,
    rotate:
      restingRotate +
      (expandedRotate -
        restingRotate) *
        expanded,
  };
}

function SubCardStack({
  achievements,
  visible,
  outro,
  masterFlipped,
  hoveredId,
  onHover,
}: {
  achievements: Achievement[];
  visible: boolean;
  outro: number;
  masterFlipped: boolean;
  hoveredId: string | null;
  onHover: (
    id: string | null
  ) => void;
}) {
  const [
    flippedId,
    setFlippedId,
  ] = useState<string | null>(
    null
  );

  const [
    stackHovered,
    setStackHovered,
  ] = useState(false);

  useEffect(() => {
    if (!masterFlipped) {
      setFlippedId(null);
      setStackHovered(false);
    }
  }, [masterFlipped]);

  if (!achievements.length) {
    return null;
  }

  const stackExpansion =
    masterFlipped
      ? stackHovered
        ? 1
        : 0.78
      : 0;

  return (
    <div
      className="absolute inset-0 z-[1050]"
      onMouseEnter={() =>
        setStackHovered(true)
      }
      onMouseLeave={() =>
        setStackHovered(false)
      }
      style={{
        pointerEvents:
          visible &&
          masterFlipped
            ? "auto"
            : "none",
      }}
    >
      {achievements.map(
        (
          achievement,
          index
        ) => {
          const achievementId =
            getAchievementId(
              achievement,
              index
            );

          const position =
            getSubcardPosition(
              index,
              achievements.length,
              stackExpansion
            );

          const hovered =
            hoveredId ===
            achievementId;

          const flipped =
            flippedId ===
            achievementId;

          const focused =
            hovered ||
            flipped;

          const masterClearance =
            Math.min(
              1,
              stackExpansion *
                1.08
            );

          const finalX =
            position.x *
            masterClearance;

          const finalY =
            position.y *
            masterClearance;

          const finalRotate =
            position.rotate;

          return (
            <button
              key={achievementId}
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setFlippedId(
                  (current) =>
                    current ===
                    achievementId
                      ? null
                      : achievementId
                );
              }}
              onMouseEnter={() =>
                onHover(
                  achievementId
                )
              }
              onMouseLeave={() =>
                onHover(null)
              }
              onFocus={() =>
                onHover(
                  achievementId
                )
              }
              onBlur={() =>
                onHover(null)
              }
              className="absolute left-1/2 top-1/2 h-[300px] w-[200px] md:h-[325px] md:w-[215px]"
              style={{
                zIndex:
                  focused
                    ? 1350
                    : 1080 -
                      index,
                opacity:
                  visible &&
                  masterFlipped
                    ? 1 -
                      outro *
                        0.15
                    : 0,
                pointerEvents:
                  visible &&
                  masterFlipped
                    ? "auto"
                    : "none",
                perspective:
                  "1800px",
                transform: `translate3d(calc(-50% + ${finalX}px),calc(-50% + ${finalY}px),${
                  flipped
                    ? 34
                    : hovered
                      ? 22
                      : 0
                }px) rotate(${finalRotate}deg) scale(${
                  flipped
                    ? 1.08
                    : hovered
                      ? 1.045
                      : 1
                })`,
                transformOrigin:
                  "center center",
                transition:
                  "transform 760ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease, filter 400ms ease",
                filter:
                  hovered || flipped
                    ? "drop-shadow(0 28px 42px rgba(0,0,0,0.22))"
                    : "none",
              }}
            >
              <CardFace
                achievement={
                  achievement
                }
                flipped={
                  flipped
                }
              />
            </button>
          );
        }
      )}
    </div>
  );
}

export default function Achievements() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const [
    achievements,
    setAchievements,
  ] = useState<Achievement[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    scrollProgress,
    setScrollProgress,
  ] = useState(0);

  const [
    activeMasterId,
    setActiveMasterId,
  ] = useState<string | null>(
    null
  );

  const [
    masterFlipped,
    setMasterFlipped,
  ] = useState(false);

  const [
    standaloneFlippedId,
    setStandaloneFlippedId,
  ] = useState<string | null>(
    null
  );

  const [
    hoveredId,
    setHoveredId,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    const load =
      async () => {
        try {
          const data =
            await getPublishedAchievements();

          if (mounted) {
            setAchievements(
              data
            );
          }
        } catch (error) {
          console.error(
            "Failed to load achievements:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const section =
      sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;

    const update =
      () => {
        frame = 0;

        const rect =
          section.getBoundingClientRect();

        const scrollable =
          Math.max(
            section.offsetHeight -
              window.innerHeight,
            1
          );

        setScrollProgress(
          clamp(
            -rect.top /
              scrollable
          )
        );
      };

    const onScroll =
      () => {
        if (frame) {
          return;
        }

        frame =
          window.requestAnimationFrame(
            update
          );
      };

    update();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      onScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        onScroll
      );

      if (frame) {
        window.cancelAnimationFrame(
          frame
        );
      }
    };
  }, []);

  const topLevelAchievements =
    useMemo(
      () =>
        achievements
          .filter(
            (achievement) => {
              const parentReference =
                getParentReference(achievement);

              return (
                !parentReference &&
                (achievement.structure ===
                  "master" ||
                  achievement.structure ===
                    "standalone")
              );
            }
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      [achievements]
    );

  const activeMaster =
    topLevelAchievements.find(
      (achievement) =>
        achievement.id ===
          activeMasterId &&
        achievement.structure ===
          "master"
    ) ?? null;

  const subAchievements =
    useMemo(() => {
      if (!activeMaster) {
        return [];
      }

      const masterId =
        activeMaster.id ??
        activeMasterId;

      const nested =
        getNestedAchievements(
          activeMaster
        );

      const linked = achievements.filter(
        (achievement) =>
          getParentReference(
            achievement
          ) === masterId
      );

      const merged = [
        ...nested,
        ...linked,
      ];

      const seen = new Set<string>();

      return merged
        .filter((achievement, index) => {
          const id = getAchievementId(
            achievement,
            index
          );

          if (seen.has(id)) {
            return false;
          }

          seen.add(id);
          return true;
        })
        .sort(
          (a, b) =>
            a.displayOrder -
            b.displayOrder
        );
    }, [
      activeMaster,
      activeMasterId,
      achievements,
    ]);

  const headingProgress =
    easeOut(
      clamp(
        scrollProgress /
          0.18
      )
    );

  const cardRevealProgress =
    easeInOut(
      clamp(
        (scrollProgress -
          0.16) /
          0.22
      )
    );

  const expansion =
    easeInOut(
      clamp(
        (scrollProgress -
          0.32) /
          0.25
      )
    );

  const outro =
    easeInOut(
      clamp(
        (scrollProgress -
          0.76) /
          0.2
      )
    );

  const cardsVisible =
    cardRevealProgress >
    0.02;

  const masterFocusMode =
    Boolean(
      activeMaster &&
        masterFlipped
    );

  const handleAchievementClick =
    (
      achievement: Achievement
    ) => {
      if (!achievement.id) {
        return;
      }

      const achievementId =
        achievement.id;

      if (
        achievement.structure ===
        "standalone"
      ) {
        setActiveMasterId(
          null
        );

        setMasterFlipped(
          false
        );

        setStandaloneFlippedId(
          (current) =>
            current ===
            achievementId
              ? null
              : achievementId
        );

        return;
      }

      if (
        achievement.structure ===
        "master"
      ) {
        setStandaloneFlippedId(
          null
        );

        if (
          activeMasterId ===
          achievementId
        ) {
          setMasterFlipped(
            (current) =>
              !current
          );

          return;
        }

        setActiveMasterId(
          achievementId
        );

        setMasterFlipped(
          false
        );

        requestAnimationFrame(
          () => {
            requestAnimationFrame(
              () => {
                setMasterFlipped(
                  true
                );
              }
            );
          }
        );
      }
    };

  return (
    <section
      ref={sectionRef}
      id="achievements"
      className="relative border-t"
      style={{
        minHeight:
          "235svh",
        backgroundColor:
          "var(--portfolio-background)",
        color:
          "var(--portfolio-text)",
        borderColor:
          "var(--portfolio-border)",
      }}
    >
      <style jsx global>{`
        .recognition-card-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .recognition-card-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative h-full w-full">
          <div
            className="absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-[1450px] px-6 pt-14 sm:px-10 md:px-14 md:pt-16 lg:px-20"
            style={{
              opacity:
                1 -
                outro * 0.9,
              transform: `translate3d(0,${
                -outro * 70
              }px,0)`,
            }}
          >
            <p
              className="mb-4 font-mono text-[8px] uppercase tracking-[0.28em]"
              style={{
                color:
                  "var(--portfolio-muted)",
                opacity:
                  headingProgress,
              }}
            >
              / Recognition
            </p>

            <RecognitionHeading
              progress={
                headingProgress
              }
            />
          </div>

          <div
            className="absolute inset-0 z-[10]"
            style={{
              backgroundColor:
                "var(--portfolio-background)",
              opacity:
                masterFocusMode
                  ? 0.68
                  : 0,
              backdropFilter:
                masterFocusMode
                  ? "blur(18px)"
                  : "blur(0px)",
              WebkitBackdropFilter:
                masterFocusMode
                  ? "blur(18px)"
                  : "blur(0px)",
              transition:
                "opacity 1100ms cubic-bezier(0.16,1,0.3,1), backdrop-filter 1100ms cubic-bezier(0.16,1,0.3,1)",
              pointerEvents:
                "none",
            }}
          />

          <div
            className="absolute inset-0 z-[20] flex items-center justify-center px-4 pt-[125px] sm:px-8 md:px-12 md:pt-[140px] lg:px-20"
            style={{
              opacity:
                cardsVisible
                  ? 1 -
                    outro * 0.35
                  : 0,
              transform: `translate3d(0,${
                (1 -
                  cardRevealProgress) *
                65
              }px,0) scale(${
                0.9 +
                cardRevealProgress *
                  0.1 -
                outro * 0.04
              })`,
              pointerEvents:
                cardsVisible
                  ? "auto"
                  : "none",
            }}
          >
            {loading ? (
              <div
                className="h-[325px] w-[215px] rounded-[1.45rem] border opacity-30"
                style={{
                  borderColor:
                    "var(--portfolio-border)",
                }}
              />
            ) : topLevelAchievements.length ===
              0 ? (
              <p
                className="font-mono text-[8px] uppercase tracking-[0.25em]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              >
                No published recognition
              </p>
            ) : (
              <div className="relative h-[610px] w-full max-w-[1250px]">
                <div
                  className="absolute inset-0"
                  style={{
                    opacity:
                      masterFocusMode
                        ? 0
                        : 1,
                    transition:
                      "opacity 1050ms cubic-bezier(0.16,1,0.3,1)",
                    pointerEvents:
                      masterFocusMode
                        ? "none"
                        : "auto",
                  }}
                >
                  {topLevelAchievements.map(
                    (
                      achievement,
                      index
                    ) => {
                      const achievementId =
                        achievement.id ??
                        `achievement-${index}-${achievement.title}`;

                      const selectedMaster =
                        achievement.structure ===
                          "master" &&
                        achievement.id ===
                          activeMasterId;

                      const selectedStandalone =
                        achievement.structure ===
                          "standalone" &&
                        achievement.id ===
                          standaloneFlippedId;

                      return (
                        <RecognitionCard
                          key={achievementId}
                          achievement={
                            achievement
                          }
                          index={
                            index
                          }
                          total={
                            topLevelAchievements.length
                          }
                          hovered={
                            hoveredId ===
                            achievementId
                          }
                          flipped={
                            selectedMaster
                              ? masterFlipped
                              : selectedStandalone
                          }
                          selected={
                            selectedMaster ||
                            selectedStandalone
                          }
                          visible={
                            cardsVisible
                          }
                          expansion={
                            expansion
                          }
                          outro={
                            outro
                          }
                          focused={
                            selectedMaster ||
                            selectedStandalone
                          }
                          onHover={(
                            value
                          ) =>
                            setHoveredId(
                              value
                                ? achievementId
                                : null
                            )
                          }
                          onClick={() =>
                            handleAchievementClick(
                              achievement
                            )
                          }
                        />
                      );
                    }
                  )}
                </div>

                {activeMaster && (
                  <div
                    className="absolute inset-0 z-[900]"
                    style={{
                      opacity:
                        masterFocusMode
                          ? 1
                          : 0,
                      pointerEvents:
                        "none",
                      transition:
                        "opacity 850ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {masterFlipped && (
                      <SubCardStack
                        achievements={
                          subAchievements
                        }
                        visible={
                          true
                        }
                        outro={
                          outro
                        }
                        masterFlipped={
                          masterFlipped
                        }
                        hoveredId={
                          hoveredId
                        }
                        onHover={(
                          id
                        ) =>
                          setHoveredId(
                            id
                          )
                        }
                      />
                    )}

                    <div
                      className="absolute inset-0 z-[1450]"
                      style={{
                        opacity:
                          masterFlipped
                            ? 1
                            : 0,
                        transform:
                          masterFlipped
                            ? "translate3d(0,0,0) scale(1)"
                            : "translate3d(0,22px,0) scale(0.94)",
                        transition:
                          "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <RecognitionCard
                        achievement={
                          activeMaster
                        }
                        index={0}
                        total={1}
                        hovered={
                          hoveredId ===
                          (activeMaster.id ??
                            "active-master")
                        }
                        flipped={
                          masterFlipped
                        }
                        selected={true}
                        visible={true}
                        expansion={0}
                        outro={outro}
                        focused={true}
                        onHover={(
                          value
                        ) =>
                          setHoveredId(
                            value
                              ? activeMaster.id ??
                                  "active-master"
                              : null
                          )
                        }
                        onClick={() =>
                          handleAchievementClick(
                            activeMaster
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!masterFocusMode &&
            cardsVisible &&
            topLevelAchievements.length >
              1 && (
              <p
                className="pointer-events-none absolute bottom-7 left-1/2 z-40 -translate-x-1/2 font-mono text-[7px] uppercase tracking-[0.28em]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                  opacity:
                    1 - outro,
                }}
              >
                Hover · Explore · Select
              </p>
            )}

          <div
            className="pointer-events-none absolute inset-0 z-[1400]"
            style={{
              backgroundColor:
                "var(--portfolio-background)",
              opacity:
                outro * 0.72,
            }}
          />
        </div>
      </div>
    </section>
  );
}