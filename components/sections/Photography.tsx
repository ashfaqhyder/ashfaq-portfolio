"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getPublishedPhotography,
  Photography as PhotographyItem,
} from "@/services/photography";

interface PhotoLayout {
  left: number;
  top: number;
  width: number;
  rotation: number;
  depth: number;
}

const PHOTO_LAYOUTS: PhotoLayout[] = [
  { left: 9, top: 7, width: 22, rotation: -5, depth: 3 },
  { left: 31, top: 3, width: 27, rotation: 3, depth: 5 },
  { left: 60, top: 9, width: 20, rotation: 6, depth: 4 },
  { left: 78, top: 5, width: 19, rotation: -4, depth: 2 },
  { left: 17, top: 31, width: 25, rotation: 4, depth: 7 },
  { left: 40, top: 28, width: 24, rotation: -3, depth: 10 },
  { left: 64, top: 33, width: 27, rotation: 5, depth: 8 },
  { left: 3, top: 58, width: 22, rotation: 4, depth: 4 },
  { left: 25, top: 62, width: 20, rotation: -6, depth: 6 },
  { left: 47, top: 58, width: 25, rotation: 3, depth: 9 },
  { left: 73, top: 60, width: 21, rotation: -4, depth: 5 },
];

export default function Photography() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [photos, setPhotos] = useState<PhotographyItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] =
    useState<PhotographyItem | null>(null);
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] =
    useState(false);

  const [detailDirection, setDetailDirection] =
    useState<"next" | "previous" | null>(null);

  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    async function loadPhotography() {
      try {
        const data = await getPublishedPhotography();
        setPhotos(data);
      } catch (error) {
        console.error(
          "Failed to load photography:",
          error
        );
      }
    }

    loadPhotography();
  }, []);

  const orderedPhotos = useMemo(() => {
    return [...photos].sort(
      (a, b) =>
        (a.displayOrder ?? 0) -
        (b.displayOrder ?? 0)
    );
  }, [photos]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedPhoto]);

  useEffect(() => {
    if (
      selectedPhoto === null ||
      selectedIndex === null
    ) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedPhoto,
    selectedIndex,
    orderedPhotos,
  ]);

  function openDetail(
    photo: PhotographyItem,
    index: number
  ) {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    setDetailDirection(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDetailVisible(true);
      });
    });
  }

  function closeDetail() {
    setIsDetailVisible(false);

    window.setTimeout(() => {
      setSelectedPhoto(null);
      setSelectedIndex(null);
      setDetailDirection(null);
    }, 450);
  }

  function changePhoto(
    nextIndex: number,
    direction: "next" | "previous"
  ) {
    if (orderedPhotos.length === 0) {
      return;
    }

    const normalizedIndex =
      (nextIndex +
        orderedPhotos.length) %
      orderedPhotos.length;

    setDetailDirection(direction);
    setSelectedIndex(normalizedIndex);
    setSelectedPhoto(
      orderedPhotos[normalizedIndex]
    );
  }

  function showPrevious() {
    if (
      selectedIndex === null ||
      orderedPhotos.length === 0
    ) {
      return;
    }

    changePhoto(
      selectedIndex - 1,
      "previous"
    );
  }

  function showNext() {
    if (
      selectedIndex === null ||
      orderedPhotos.length === 0
    ) {
      return;
    }

    changePhoto(
      selectedIndex + 1,
      "next"
    );
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (selectedPhoto) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const y =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    setPointer({
      x,
      y,
    });
  }

  function resetPointer() {
    setPointer({
      x: 0,
      y: 0,
    });
  }

  if (orderedPhotos.length === 0) {
    return (
      <section
        ref={sectionRef}
        id="outside-the-code"
        className="border-t border-neutral-900 px-6 py-24 md:px-10 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-600">
            08 / Outside the Code
          </p>

          <h2 className="text-4xl font-medium tracking-tight md:text-6xl">
            Outside the Code.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500">
            When I&apos;m not building things, I
            like to slow down and capture the
            moments around me.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="photography"
      className="relative overflow-hidden border-t border-neutral-900 bg-[#050505] px-6 py-24 md:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* INTRO */}

        <div
          className="relative z-[200] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateY(0)"
              : "translateY(40px)",
          }}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-600">
            08 / Outside the Code
          </p>

          <h2 className="text-4xl font-medium tracking-tight md:text-6xl">
            Outside the Code.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500">
            When I&apos;m not building things, I
            like to slow down and capture the
            moments around me.
          </p>
        </div>

        {/* PHOTO FIELD */}

        <div
          className="photo-field relative mt-14 h-[1250px] w-full md:mt-20 md:h-[1400px] lg:h-[1500px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
        >
          {orderedPhotos.map((photo, index) => {
            const layout =
              PHOTO_LAYOUTS[
                index %
                  PHOTO_LAYOUTS.length
              ];

            const parallaxMultiplier =
              8 + (index % 4) * 3;

            const parallaxX =
              pointer.x *
              parallaxMultiplier;

            const parallaxY =
              pointer.y *
              (parallaxMultiplier * 0.7);

            const delay =
              120 + index * 90;

            return (
              <article
                key={
                  photo.id ??
                  `${photo.title}-${index}`
                }
                className="group absolute cursor-pointer outline-none"
                style={{
                  left: `${layout.left}%`,
                  top: `${layout.top}%`,
                  width: `${layout.width}%`,
                  zIndex: layout.depth,
                  opacity: isVisible ? 1 : 0,

                  transform: isVisible
                    ? `
                        translate3d(
                          calc(-50% + ${parallaxX}px),
                          calc(-50% + ${parallaxY}px),
                          0
                        )
                        rotate(${layout.rotation}deg)
                      `
                    : `
                        translate3d(
                          calc(-50% + ${parallaxX}px),
                          calc(-50% + ${parallaxY + 45}px),
                          0
                        )
                        rotate(${layout.rotation + 3}deg)
                        scale(0.94)
                      `,

                  transitionProperty:
                    "transform, opacity",

                  transitionDuration:
                    "1200ms",

                  transitionTimingFunction:
                    "cubic-bezier(0.16,1,0.3,1)",

                  transitionDelay: isVisible
                    ? `${delay}ms`
                    : "0ms",
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open ${photo.title}`}
                onClick={() =>
                  openDetail(
                    photo,
                    index
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    openDetail(
                      photo,
                      index
                    );
                  }
                }}
              >
                {/* PHOTO FRAME */}

                <div className="relative bg-[#0a0a0a] p-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-hover:bg-[#0d0d0d] group-hover:shadow-[0_30px_90px_rgba(0,0,0,0.5)] md:p-[10px]">
                  {/* Outer border */}

                  <div className="pointer-events-none absolute inset-0 border border-white/[0.14] transition-colors duration-500 group-hover:border-white/[0.32]" />

                  {/* Inner border */}

                  <div className="pointer-events-none absolute inset-[5px] border border-white/[0.05] transition-colors duration-500 group-hover:border-white/[0.14] md:inset-[7px]" />

                  {/* IMAGE */}

                  <div className="relative overflow-hidden">
                    <img
                      src={photo.photo}
                      alt={photo.title}
                      draggable={false}
                      className="block h-auto w-full select-none object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] group-hover:brightness-[0.62]"
                    />

                    {/* HOVER TITLE */}

                    <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 md:p-5">
                      {/* Gradient */}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Title */}

                      <div className="relative z-10 translate-y-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
                        <p className="text-xs font-medium tracking-wide text-white md:text-sm">
                          {photo.title}
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-neutral-300">
                          {photo.location}
                        </p>
                      </div>

                      {/* Open */}

                      <span className="relative z-10 translate-y-3 text-[9px] uppercase tracking-[0.2em] text-neutral-300 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white">
                        Open ↗
                      </span>
                    </div>

                    {/* Hover border */}

                    <div className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-white/[0.28]" />
                  </div>
                </div>
              </article>
            );
          })}

          {/* EDITORIAL ANNOTATIONS */}

          <div
            className="pointer-events-none absolute right-2 top-[18%] hidden rotate-[-4deg] text-right text-[10px] uppercase tracking-[0.25em] text-neutral-700 transition-opacity duration-1000 md:block"
            style={{
              opacity: isVisible ? 1 : 0,
            }}
          >
            Different places.
            <br />
            Same curiosity.
          </div>

          <div
            className="pointer-events-none absolute left-0 top-[48%] hidden rotate-[-8deg] text-[10px] uppercase tracking-[0.25em] text-neutral-700 transition-opacity duration-1000 md:block"
            style={{
              opacity: isVisible ? 1 : 0,
            }}
          >
            Small
            <br />
            encounters.
          </div>

          <div
            className="pointer-events-none absolute right-1 bottom-[17%] hidden rotate-[5deg] text-right text-[10px] uppercase tracking-[0.25em] text-neutral-700 transition-opacity duration-1000 md:block"
            style={{
              opacity: isVisible ? 1 : 0,
            }}
          >
            Details
            <br />
            matter.
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="relative z-20 flex items-center justify-between border-t border-neutral-900 pt-6 text-[10px] uppercase tracking-[0.25em] text-neutral-700 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateY(0)"
              : "translateY(25px)",
          }}
        >
          <span>Photography</span>

          <span className="hidden md:block">
            Move through the moments
          </span>

          <span className="md:hidden">
            Tap a photograph
          </span>
        </div>
      </div>

      {/* ================================================= */}
      {/* EXPANDED DETAIL VIEW                              */}
      {/* ================================================= */}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6 md:px-8 md:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="photography-detail-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDetail();
            }
          }}
          style={{
            opacity: isDetailVisible ? 1 : 0,
            transition:
              "opacity 450ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            style={{
              opacity: isDetailVisible
                ? 1
                : 0,
              transition:
                "opacity 500ms ease",
            }}
          />

          {/* DETAIL CARD */}

          <div
            className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-white/[0.16] bg-[#090909] shadow-[0_40px_120px_rgba(0,0,0,0.65)] md:flex-row"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              opacity: isDetailVisible
                ? 1
                : 0,

              transform: isDetailVisible
                ? "translateY(0) scale(1)"
                : "translateY(35px) scale(0.96)",

              transition:
                "opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 650ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Inner border */}

            <div className="pointer-events-none absolute inset-2 z-20 border border-white/[0.06]" />

            {/* IMAGE */}

            <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden bg-[#050505] p-5 md:min-h-[600px] md:p-10">
              <img
                key={selectedPhoto.id}
                src={selectedPhoto.photo}
                alt={selectedPhoto.title}
                className="relative z-10 max-h-[52vh] max-w-full object-contain md:max-h-[72vh]"
                style={{
                  animation:
                    detailDirection === "next"
                      ? "photoDetailNext 450ms cubic-bezier(0.16,1,0.3,1)"
                      : detailDirection ===
                          "previous"
                        ? "photoDetailPrevious 450ms cubic-bezier(0.16,1,0.3,1)"
                        : undefined,
                }}
              />

              <div className="pointer-events-none absolute inset-5 border border-white/[0.08] md:inset-10" />
            </div>

            {/* INFORMATION */}

            <div className="relative flex w-full min-w-0 flex-col justify-between overflow-y-auto border-t border-white/[0.08] p-7 md:w-[380px] md:border-l md:border-t-0 md:p-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                  Photography /
                  {String(
                    (selectedIndex ?? 0) + 1
                  ).padStart(2, "0")}
                  {" "}
                  <span className="text-neutral-800">
                    OF{" "}
                    {String(
                      orderedPhotos.length
                    ).padStart(2, "0")}
                  </span>
                </p>

                <h3
                  id="photography-detail-title"
                  className="mt-6 text-3xl font-medium leading-tight tracking-[-0.03em] text-white md:text-4xl"
                >
                  {selectedPhoto.title}
                </h3>

                {/* LOCATION */}

                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
                    Location
                  </p>

                  <p className="mt-2 text-sm text-neutral-300">
                    {selectedPhoto.location}
                  </p>
                </div>

                {/* DATE */}

                {selectedPhoto.date && (
                  <div className="mt-6">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
                      Date
                    </p>

                    <p className="mt-2 text-sm text-neutral-300">
                      {selectedPhoto.date}
                    </p>
                  </div>
                )}

                {/* DESCRIPTION */}

                {selectedPhoto.description && (
                  <div className="mt-6">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
                      About the moment
                    </p>

                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      {
                        selectedPhoto.description
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* CONTROLS */}

              <div className="mt-10 md:mt-12">
                <div className="grid grid-cols-2 gap-2">
                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={showPrevious}
                    disabled={
                      orderedPhotos.length <= 1
                    }
                    className="group flex min-h-12 items-center justify-between border border-white/[0.12] px-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 hover:border-white/35 hover:bg-white/[0.05] hover:text-white focus:outline-none focus:ring-1 focus:ring-white disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Previous photograph"
                  >
                    <span className="text-base transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>

                    <span>
                      Previous
                    </span>
                  </button>

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={showNext}
                    disabled={
                      orderedPhotos.length <= 1
                    }
                    className="group flex min-h-12 items-center justify-between border border-white/[0.12] px-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 hover:border-white/35 hover:bg-white/[0.05] hover:text-white focus:outline-none focus:ring-1 focus:ring-white disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next photograph"
                  >
                    <span>
                      Next
                    </span>

                    <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={closeDetail}
                  className="mt-2 flex min-h-12 w-full items-center justify-between border border-white/[0.14] bg-white/[0.02] px-5 text-[10px] uppercase tracking-[0.25em] text-neutral-400 transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-black focus:outline-none focus:ring-1 focus:ring-white"
                  aria-label="Close photography detail"
                >
                  <span>Close</span>

                  <span className="text-lg leading-none">
                    ×
                  </span>
                </button>

                <p className="mt-4 text-center text-[9px] uppercase tracking-[0.2em] text-neutral-700">
                  ← → Navigate
                  <span className="mx-2">
                    •
                  </span>
                  Esc Close
                </p>
              </div>
            </div>

            {/* TOP RIGHT CLOSE */}

            <button
              type="button"
              onClick={closeDetail}
              className="absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center border border-white/[0.14] bg-black/50 text-lg text-neutral-300 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-black focus:outline-none focus:ring-1 focus:ring-white"
              aria-label="Close photography detail"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ANIMATIONS                                        */}
      {/* ================================================= */}

      <style jsx>{`
        @keyframes photoDetailNext {
          0% {
            opacity: 0;
            transform: translateX(35px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes photoDetailPrevious {
          0% {
            opacity: 0;
            transform: translateX(-35px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @media (max-width: 767px) {
          #outside-the-code .absolute {
            max-width: 70vw;
          }

          #outside-the-code article {
            -webkit-tap-highlight-color: transparent;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          #outside-the-code * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }

          @keyframes photoDetailNext {
            from,
            to {
              opacity: 1;
              transform: none;
            }
          }

          @keyframes photoDetailPrevious {
            from,
            to {
              opacity: 1;
              transform: none;
            }
          }
        }
      `}</style>
      <style>{`
        @media (max-width: 767px) {
          #outside-the-code .photo-field {
            height: auto !important;
            min-height: 0 !important;
            display: flex;
            flex-direction: column;
            gap: 3.75rem;
            padding: 0.5rem 0.25rem 2rem;
          }

          #outside-the-code .photo-field > article {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: min(88vw, 360px) !important;
            margin: 0 auto;
            transform: none !important;
            -webkit-tap-highlight-color: transparent;
          }

          #outside-the-code .photo-field > article:nth-child(3n + 1) {
            margin-left: 0.5rem;
            margin-right: auto;
            transform: rotate(-2deg) !important;
          }

          #outside-the-code .photo-field > article:nth-child(3n + 2) {
            margin-left: auto;
            margin-right: 0.5rem;
            transform: rotate(1.5deg) !important;
          }

          #outside-the-code .photo-field > article:nth-child(3n) {
            margin-left: auto;
            margin-right: auto;
            transform: rotate(-1deg) !important;
          }
        }
      `}</style>

    </section>
  );
}