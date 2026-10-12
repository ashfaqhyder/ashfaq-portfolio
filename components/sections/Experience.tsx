"use client";

import { useEffect, useRef, useState } from "react";
import {
  Experience as ExperienceType,
  getPublishedExperience,
} from "@/services/experience";

const clamp = (
  value: number,
  min = 0,
  max = 1
) => Math.min(Math.max(value, min), max);

const lerp = (
  start: number,
  end: number,
  amount: number
) => start + (end - start) * clamp(amount);

const easeOutCubic = (value: number) => {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
};

const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function SequentialText({
  text,
  progress,
  className = "",
  style,
}: {
  text: string;
  progress: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const characters = Array.from(text);

  const meaningfulCharacters =
    characters.filter(
      (character) =>
        character !== " " &&
        character !== "\n"
    ).length;

  let characterIndex = 0;

  return (
    <span
      className={className}
      style={style}
    >
      {characters.map(
        (character, index) => {
          if (character === "\n") {
            return (
              <br
                key={`break-${index}`}
              />
            );
          }

          if (character === " ") {
            return (
              <span
                key={`space-${index}`}
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: "0.28em",
                }}
              >
                {" "}
              </span>
            );
          }

          const currentIndex =
            characterIndex++;

          const start =
            currentIndex /
            Math.max(
              meaningfulCharacters,
              1
            );

          const end =
            (currentIndex + 1) /
            Math.max(
              meaningfulCharacters,
              1
            );

          const letterProgress =
            clamp(
              (progress - start) /
                Math.max(
                  end - start,
                  0.0001
                )
            );

          const eased =
            smoothstep(
              letterProgress
            );

          return (
            <span
              key={`${character}-${index}`}
              className="inline-block"
              style={{
                color:
                  eased >= 0.98
                    ? "var(--portfolio-text)"
                    : "var(--portfolio-accent)",
                opacity: lerp(
                  0.45,
                  1,
                  eased
                ),
                transform: `
                  translate3d(
                    0,
                    ${lerp(
                      12,
                      0,
                      eased
                    )}px,
                    0
                  )
                `,
                filter: `blur(${lerp(
                  2,
                  0,
                  eased
                )}px)`,
                willChange:
                  "transform, opacity, color, filter",
              }}
            >
              {character}
            </span>
          );
        }
      )}
    </span>
  );
}

function SequentialParagraph({
  text,
  progress,
}: {
  text: string;
  progress: number;
}) {
  const characters = Array.from(text);

  const meaningfulCharacters =
    characters.filter(
      (character) =>
        character !== " " &&
        character !== "\n"
    ).length;

  let characterIndex = 0;

  return (
    <>
      {characters.map(
        (character, index) => {
          if (character === "\n") {
            return (
              <br
                key={`paragraph-break-${index}`}
              />
            );
          }

          if (character === " ") {
            return (
              <span
                key={`paragraph-space-${index}`}
                aria-hidden="true"
                className="inline-block"
                style={{
                  width: "0.27em",
                }}
              >
                {" "}
              </span>
            );
          }

          const currentIndex =
            characterIndex++;

          const start =
            currentIndex /
            Math.max(
              meaningfulCharacters,
              1
            );

          const end =
            (currentIndex + 1) /
            Math.max(
              meaningfulCharacters,
              1
            );

          const letterProgress =
            clamp(
              (progress - start) /
                Math.max(
                  end - start,
                  0.0001
                )
            );

          const eased =
            smoothstep(
              letterProgress
            );

          return (
            <span
              key={`${character}-${index}`}
              className="inline-block"
              style={{
                color:
                  eased >= 0.98
                    ? "var(--portfolio-muted)"
                    : "var(--portfolio-accent)",
                opacity: lerp(
                  0.3,
                  1,
                  eased
                ),
                transform: `
                  translate3d(
                    0,
                    ${lerp(
                      6,
                      0,
                      eased
                    )}px,
                    0
                  )
                `,
                filter: `blur(${lerp(
                  1.5,
                  0,
                  eased
                )}px)`,
                willChange:
                  "transform, opacity, color, filter",
              }}
            >
              {character}
            </span>
          );
        }
      )}
    </>
  );
}

export default function Experience() {
  const sectionRef =
    useRef<HTMLElement | null>(null);

  const [experiences, setExperiences] =
    useState<ExperienceType[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [scrollProgress, setScrollProgress] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadExperience() {
      try {
        const data =
          await getPublishedExperience();

        if (mounted) {
          setExperiences(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load experience:",
          error
        );

        if (mounted) {
          setExperiences([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadExperience();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    let targetProgress = 0;
    let currentProgress = 0;

    let previousTime =
      performance.now();

    const readScroll = () => {
      const section =
        sectionRef.current;

      if (!section) return;

      const rect =
        section.getBoundingClientRect();

      const scrollableHeight =
        Math.max(
          section.offsetHeight -
            window.innerHeight,
          1
        );

      targetProgress = clamp(
        -rect.top /
          scrollableHeight
      );
    };

    const animate = (
      time: number
    ) => {
      const delta = Math.min(
        time - previousTime,
        32
      );

      previousTime = time;

      const smoothing =
        1 -
        Math.pow(
          0.001,
          delta / 16.67
        );

      currentProgress +=
        (targetProgress -
          currentProgress) *
        smoothing;

      if (
        Math.abs(
          targetProgress -
            currentProgress
        ) < 0.00005
      ) {
        currentProgress =
          targetProgress;
      }

      setScrollProgress(
        currentProgress
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    readScroll();

    animationFrame =
      requestAnimationFrame(
        animate
      );

    window.addEventListener(
      "scroll",
      readScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      readScroll
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "scroll",
        readScroll
      );

      window.removeEventListener(
        "resize",
        readScroll
      );
    };
  }, []);

  if (loading) {
    return (
      <section
        id="experience"
        className="w-full"
        style={{
          minHeight: "100svh",
          background:
            "var(--portfolio-background)",
        }}
      />
    );
  }

  if (!experiences.length) {
    return null;
  }

  const totalStages =
    experiences.length + 1;

  const stagePosition =
    scrollProgress *
    totalStages;

  const activeStage = Math.min(
    totalStages - 1,
    Math.floor(stagePosition)
  );

  const isHeadingStage =
    activeStage === 0;

  const activeIndex =
    isHeadingStage
      ? -1
      : activeStage - 1;

  const stageProgress = clamp(
    stagePosition -
      activeStage
  );

  const headingRevealProgress =
    isHeadingStage
      ? clamp(stageProgress)
      : 1;

  const activeExperience =
    activeIndex >= 0
      ? experiences[
          activeIndex
        ]
      : null;

  const cardTransitionProgress =
    easeOutCubic(
      clamp(
        stageProgress / 0.35
      )
    );

  const organizationProgress =
    easeOutCubic(
      clamp(
        (stageProgress - 0.02) /
          0.14
      )
    );

  const roleProgress =
    easeOutCubic(
      clamp(
        (stageProgress - 0.13) /
          0.42
      )
    );

  const descriptionProgress =
    easeOutCubic(
      clamp(
        (stageProgress - 0.38) /
          0.52
      )
    );

  const metadataProgress =
    easeOutCubic(
      clamp(
        (stageProgress - 0.58) /
          0.38
      )
    );

  const cardOpacity =
    isHeadingStage
      ? 0
      : cardTransitionProgress;

  const cardTranslateY =
    isHeadingStage
      ? 40
      : lerp(
          32,
          0,
          cardTransitionProgress
        );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="
        relative
        w-full
        snap-y
        snap-mandatory
      "
      style={{
        height: `${
          totalStages * 100
        }svh`,
        background:
          "var(--portfolio-background)",
        color:
          "var(--portfolio-text)",
        scrollSnapType:
          "y mandatory",
      }}
    >
      <div
        className="
          sticky
          top-0
          h-[100svh]
          overflow-hidden
        "
      >
        <div
          className="
            relative
            mx-auto
            flex
            h-full
            w-full
            max-w-[1600px]
            flex-col
            px-6
            py-8
            sm:px-10
            md:px-14
            md:py-12
            lg:px-20
          "
        >
          <header
            className="
              relative
              z-30
              shrink-0
              pt-[4vh]
            "
          >
            <p
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.24em]
              "
              style={{
                color:
                  "var(--portfolio-muted)",
                opacity:
                  isHeadingStage
                    ? lerp(
                        0.4,
                        1,
                        easeOutCubic(
                          clamp(
                            headingRevealProgress *
                              2
                          )
                        )
                      )
                    : 1,
              }}
            >
               / EXPERIENCE
            </p>

            <h2
              className="
                mt-4
                max-w-[1000px]
                font-[Syne,sans-serif]
                text-[clamp(3rem,6.5vw,7rem)]
                font-medium
                leading-[0.86]
                tracking-[-0.07em]
              "
            >
              <SequentialText
                text="Where I've been."
                progress={
                  headingRevealProgress
                }
              />
            </h2>
          </header>

          <div
            className="
              relative
              mt-[7vh]
              min-h-0
              flex-1
              overflow-hidden
            "
          >
            {activeExperience && (
              <article
                key={
                  activeExperience.id ??
                  `${activeExperience.organization}-${activeIndex}`
                }
                className="
                  absolute
                  inset-x-0
                  top-0
                  bottom-0
                  pt-[2vh]
                "
                style={{
                  opacity:
                    cardOpacity,

                  transform: `
                    translate3d(
                      0,
                      ${cardTranslateY}px,
                      0
                    )
                  `,

                  filter: `blur(${lerp(
                    2,
                    0,
                    cardTransitionProgress
                  )}px)`,

                  willChange:
                    "transform, opacity, filter",
                }}
              >
                <div
                  className="
                    flex
                    h-full
                    flex-col
                    justify-center
                    pb-[5vh]
                  "
                >
                  <div
                    style={{
                      opacity:
                        organizationProgress,
                      transform: `
                        translate3d(
                          0,
                          ${lerp(
                            18,
                            0,
                            organizationProgress
                          )}px,
                          0
                        )
                      `,
                    }}
                  >
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-x-5
                        gap-y-2
                      "
                    >
                      <span
                        className="
                          font-mono
                          text-[10px]
                          uppercase
                          tracking-[0.2em]
                        "
                        style={{
                          color:
                            "var(--portfolio-accent)",
                        }}
                      >
                        {String(
                          activeIndex + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className="h-px w-8"
                        style={{
                          background:
                            "color-mix(in srgb, var(--portfolio-text) 18%, transparent)",
                        }}
                      />

                      <span
                        className="
                          font-mono
                          text-[9px]
                          uppercase
                          tracking-[0.18em]
                        "
                        style={{
                          color:
                            "var(--portfolio-muted)",
                        }}
                      >
                        {
                          activeExperience.organization
                        }
                      </span>

                      {activeExperience.location && (
                        <>
                          <span
                            className="h-px w-8"
                            style={{
                              background:
                                "color-mix(in srgb, var(--portfolio-text) 18%, transparent)",
                            }}
                          />

                          <span
                            className="
                              font-mono
                              text-[9px]
                              uppercase
                              tracking-[0.18em]
                            "
                            style={{
                              color:
                                "var(--portfolio-muted)",
                            }}
                          >
                            {
                              activeExperience.location
                            }
                          </span>
                        </>
                      )}

                      {activeExperience.currentlyWorking && (
                        <span
                          className="
                            ml-1
                            inline-flex
                            items-center
                            gap-2
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.18em]
                          "
                          style={{
                            color:
                              "var(--portfolio-accent)",
                          }}
                        >
                          <span
                            className="
                              relative
                              flex
                              h-1.5
                              w-1.5
                            "
                          >
                            <span
                              className="
                                absolute
                                inline-flex
                                h-full
                                w-full
                                animate-ping
                                rounded-full
                                opacity-50
                              "
                              style={{
                                background:
                                  "var(--portfolio-accent)",
                              }}
                            />

                            <span
                              className="
                                relative
                                inline-flex
                                h-1.5
                                w-1.5
                                rounded-full
                              "
                              style={{
                                background:
                                  "var(--portfolio-accent)",
                              }}
                            />
                          </span>

                          Current
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className="
                      mt-5
                      max-w-[1050px]
                      font-[Syne,sans-serif]
                      text-[clamp(2.5rem,5.6vw,6.5rem)]
                      font-medium
                      leading-[0.9]
                      tracking-[-0.065em]
                    "
                  >
                    <SequentialText
                      text={
                        activeExperience.role
                      }
                      progress={
                        roleProgress
                      }
                    />
                  </h3>

                  <div
                    className="
                      mt-7
                      grid
                      gap-8
                      lg:grid-cols-[minmax(0,720px)_180px]
                      lg:justify-between
                    "
                    style={{
                      opacity:
                        descriptionProgress,
                      transform: `
                        translate3d(
                          0,
                          ${lerp(
                            18,
                            0,
                            descriptionProgress
                          )}px,
                          0
                        )
                      `,
                    }}
                  >
                    <p
                      className="
                        max-w-[720px]
                        font-[Manrope,sans-serif]
                        text-[clamp(.9rem,1.05vw,1.05rem)]
                        leading-[1.8]
                      "
                    >
                      <SequentialParagraph
                        text={
                          activeExperience.description
                        }
                        progress={
                          descriptionProgress
                        }
                      />
                    </p>

                    <div
                      className="lg:text-right"
                      style={{
                        opacity:
                          metadataProgress,
                        transform: `
                          translate3d(
                            0,
                            ${lerp(
                              14,
                              0,
                              metadataProgress
                            )}px,
                            0
                          )
                        `,
                      }}
                    >
                      <p
                        className="
                          font-mono
                          text-[8px]
                          uppercase
                          tracking-[0.18em]
                        "
                        style={{
                          color:
                            "var(--portfolio-muted)",
                        }}
                      >
                        Period
                      </p>

                      <p
                        className="
                          mt-2
                          font-mono
                          text-xs
                        "
                        style={{
                          color:
                            "var(--portfolio-text)",
                        }}
                      >
                        {
                          activeExperience.startDate
                        }

                        {" — "}

                        {activeExperience.currentlyWorking
                          ? "Present"
                          : activeExperience.endDate}
                      </p>

                      {activeExperience.currentlyWorking && (
                        <p
                          className="
                            mt-2
                            font-mono
                            text-[8px]
                            uppercase
                            tracking-[0.16em]
                          "
                          style={{
                            color:
                              "var(--portfolio-accent)",
                          }}
                        >
                          Currently here
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="
                      mt-8
                      flex
                      flex-col
                      gap-6
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                    style={{
                      opacity:
                        metadataProgress,
                      transform: `
                        translate3d(
                          0,
                          ${lerp(
                            15,
                            0,
                            metadataProgress
                          )}px,
                          0
                        )
                      `,
                    }}
                  >
                    {activeExperience.responsibilities?.length >
                      0 && (
                      <div
                        className="
                          grid
                          max-w-[720px]
                          gap-x-8
                          gap-y-2
                          sm:grid-cols-2
                        "
                      >
                        {activeExperience.responsibilities
                          .slice(0, 4)
                          .map(
                            (
                              responsibility,
                              responsibilityIndex
                            ) => (
                              <div
                                key={`${activeExperience.id}-responsibility-${responsibilityIndex}`}
                                className="
                                  flex
                                  gap-3
                                  font-[Manrope,sans-serif]
                                  text-xs
                                  leading-5
                                "
                                style={{
                                  color:
                                    "var(--portfolio-muted)",
                                }}
                              >
                                <span
                                  style={{
                                    color:
                                      "var(--portfolio-accent)",
                                  }}
                                >
                                  /
                                </span>

                                <span>
                                  {
                                    responsibility
                                  }
                                </span>
                              </div>
                            )
                          )}
                      </div>
                    )}

                    {activeExperience.technologies?.length >
                      0 && (
                      <div
                        className="
                          flex
                          max-w-[400px]
                          flex-wrap
                          gap-x-4
                          gap-y-2
                          sm:justify-end
                        "
                      >
                        {activeExperience.technologies.map(
                          (
                            technology
                          ) => (
                            <span
                              key={
                                technology
                              }
                              className="
                                font-mono
                                text-[8px]
                                uppercase
                                tracking-[0.12em]
                              "
                              style={{
                                color:
                                  "var(--portfolio-muted)",
                              }}
                            >
                              {
                                technology
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )}
          </div>

          <div
            className="
              absolute
              bottom-8
              left-6
              right-6
              z-40
              flex
              items-center
              justify-between
              sm:left-10
              sm:right-10
              md:left-14
              md:right-14
              lg:left-20
              lg:right-20
            "
          >
            <div
              className="
                hidden
                h-px
                w-24
                overflow-hidden
                sm:block
              "
              style={{
                background:
                  "color-mix(in srgb, var(--portfolio-text) 12%, transparent)",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${
                    ((activeStage + 1) /
                      totalStages) *
                    100
                  }%`,
                  background:
                    "var(--portfolio-accent)",
                }}
              />
            </div>

            <div
              className="
                ml-auto
                font-mono
                text-[8px]
                uppercase
                tracking-[0.18em]
              "
              style={{
                color:
                  "var(--portfolio-muted)",
              }}
            >
              {activeStage === 0
                ? "00"
                : String(
                    activeIndex + 1
                  ).padStart(
                    2,
                    "0"
                  )}

              {" / "}

              {String(
                experiences.length
              ).padStart(
                2,
                "0"
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}