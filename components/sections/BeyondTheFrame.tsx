"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Expo, gsap, Power1, Quint } from "gsap";
import {
  getPublishedScreenCulturePosters,
  type ScreenCultureCategory,
  type ScreenCulturePoster,
} from "@/services/screen-culture";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
function easeOut(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}
function range(value: number, start: number, end: number) {
  return clamp((value - start) / Math.max(end - start, 0.0001));
}

function ScrollHeading({ text, progress }: { text: string; progress: number }) {
  return (
    <h2 aria-label={text} className="font-[Syne,sans-serif] text-[clamp(2.8rem,4.8vw,5.2rem)] font-medium leading-[.9] tracking-[-.06em]">
      {Array.from(text).map((character, index) => {
        const start = index / Math.max(text.length, 1);
        const end = (index + 1) / Math.max(text.length, 1);
        const reveal = easeOut(range(progress, start, end));
        return (
          <span
            key={`${character}-${index}`}
            style={{
              display: "inline-block",
              color: reveal > 0.5 ? "var(--portfolio-text)" : "var(--portfolio-accent)",
              opacity: 0.12 + reveal * 0.88,
              transform: `translate3d(0, ${(1 - reveal) * 9}px, 0)`,
              filter: `blur(${(1 - reveal) * 1.4}px)`,
              transition: "color 500ms cubic-bezier(.16,1,.3,1), opacity 400ms ease",
              willChange: "transform, color, opacity, filter",
            }}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        );
      })}
    </h2>
  );
}

interface ImageTrailProps {
  images: string[];
  imageWidth?: number;
  imageHeight?: number;
  threshold?: number;
  duration?: number;
}

// Cursor-trail animation follows the supplied GSAP implementation.
function ImageTrail({
  images = [],
  imageWidth = 260,
  imageHeight = 340,
  threshold = 50,
  duration = 1.6,
}: ImageTrailProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const cacheMousePos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const zIndexVal = useRef(1);
  const imgPosition = useRef(0);
  const parentSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const content = contentRef.current;
    if (content) imagesRef.current = Array.from(content.querySelectorAll("img"));

    const calcParentSize = () => {
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) parentSize.current = { width: rect.width, height: rect.height };
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = contentRef.current?.getBoundingClientRect();
      if (touch && rect) mousePos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };
    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const getMouseDistance = () => Math.hypot(
      mousePos.current.x - lastMousePos.current.x,
      mousePos.current.y - lastMousePos.current.y,
    );
    let raf = 0;
    let running = true;
    const showNextImage = () => {
      const img = imagesRef.current[imgPosition.current];
      if (!img) return;
      const rect = img.getBoundingClientRect();
      gsap.killTweensOf(img);
      gsap.timeline()
        .set(img, {
          startAt: { opacity: 0 }, opacity: 1, zIndex: zIndexVal.current,
          x: cacheMousePos.current.x - rect.width / 2,
          y: cacheMousePos.current.y - rect.height / 2,
        })
        .to(img, {
          duration, ease: Expo.easeOut,
          x: mousePos.current.x - rect.width / 2,
          y: mousePos.current.y - rect.height / 2,
        })
        .to(img, { duration: 1, ease: Power1.easeOut, opacity: 0 }, duration - 1 > 0 ? duration - 1 : 0.4)
        .to(img, {
          duration: 1, ease: Quint.easeInOut,
          y: `+=${parentSize.current.height + rect.height / 2}`,
        }, duration - 1 > 0 ? duration - 1 : 0.4);
    };
    const renderImages = () => {
      if (!running) return;
      const distance = getMouseDistance();
      cacheMousePos.current.x = lerp(cacheMousePos.current.x, mousePos.current.x, 0.1);
      cacheMousePos.current.y = lerp(cacheMousePos.current.y, mousePos.current.y, 0.1);
      if (distance > threshold && imagesRef.current.length > 0) {
        showNextImage();
        zIndexVal.current += 1;
        imgPosition.current = (imgPosition.current + 1) % imagesRef.current.length;
        lastMousePos.current = { ...mousePos.current };
      }
      raf = requestAnimationFrame(renderImages);
    };

    calcParentSize();
    if (!imagesRef.current.length) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", calcParentSize);
    raf = requestAnimationFrame(renderImages);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", calcParentSize);
      imagesRef.current.forEach((img) => gsap.killTweensOf(img));
    };
  }, [images, threshold, duration]);

  return (
    <div
      ref={contentRef}
      style={{ "--image-width": `${imageWidth}px`, "--image-height": `${imageHeight}px` } as React.CSSProperties}
      className="relative isolate z-0 h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      {images.map((url, index) => (
        <img
          key={`${url}-${index}`}
          className="pointer-events-none absolute left-0 top-0 h-[var(--image-height)] w-[var(--image-width)] select-none object-cover opacity-0 will-change-transform"
          src={url}
          alt={`trail element ${index + 1}`}
          draggable={false}
        />
      ))}
    </div>
  );
}

export default function BeyondTheFrame() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const posterViewportRef = useRef<HTMLDivElement | null>(null);
  const scrollLockRef = useRef<{ scrollY: number; bodyPosition: string; bodyTop: string; bodyWidth: string; htmlOverflow: string } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [posters, setPosters] = useState<ScreenCulturePoster[]>([]);
  const [category, setCategory] = useState<ScreenCultureCategory>("movies-series");
  const [enteredGallery, setEnteredGallery] = useState(false);
  const galleryBackStateRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasBrowsed, setHasBrowsed] = useState(false);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collectionError, setCollectionError] = useState(false);

  useEffect(() => {
    let alive = true;
    // The service queries published records only and sorts locally, avoiding
    // the published + displayOrder composite-index requirement.
    getPublishedScreenCulturePosters()
      .then((items) => {
        if (!alive) return;
        setPosters(items.filter((item) => item.imageUrl && item.title && item.imdbUrl)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
      })
      .catch((error) => {
        console.error("Could not load Screen Culture posters", error);
        if (alive) setCollectionError(true);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const activePosters = useMemo(
    () => posters.filter((poster) => poster.category === category),
    [posters, category],
  );
  const trailPosterImages = useMemo(
    () => activePosters.map((poster) => poster.imageUrl),
    [activePosters],
  );
  const trailImagesForMode = useMemo(
    () => hasBrowsed && activePosters[activeIndex] ? [activePosters[activeIndex].imageUrl] : trailPosterImages,
    [hasBrowsed, activePosters, activeIndex, trailPosterImages],
  );
  useEffect(() => { setActiveIndex(0); setHasBrowsed(false); }, [category]);

  // Lock document scrolling while a collection is open so wheel/touch input
  // is reserved for browsing posters. Restore the previous page state on exit.
  useEffect(() => {
    if (!enteredGallery || typeof window === "undefined") return;

    const body = document.body;
    const html = document.documentElement;
    const lock = {
      scrollY: window.scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: html.style.overflow,
    };
    scrollLockRef.current = lock;

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lock.scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = lock.htmlOverflow;
      body.style.position = lock.bodyPosition;
      body.style.top = lock.bodyTop;
      body.style.width = lock.bodyWidth;
      window.scrollTo(0, lock.scrollY);
      scrollLockRef.current = null;
    };
  }, [enteredGallery]);

  // The intro remains in normal page flow. Once a category is entered, the sticky
  // full-viewport scene captures wheel input so browsing never scrolls the page.

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      setSectionProgress(clamp(-section.getBoundingClientRect().top / distance));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    if (!enteredGallery || !activePosters.length) return;
    event.preventDefault();
    setHasBrowsed(true);
    const direction = event.deltaY > 0 ? 1 : -1;
    setActiveIndex((current) => (current + direction + activePosters.length) % activePosters.length);
  }, [enteredGallery, activePosters.length]);

  // A swipe is the mobile equivalent of the desktop wheel gesture.
  const handleTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    if (!enteredGallery || !activePosters.length) return;
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enteredGallery, activePosters.length]);

  const handleTouchEnd = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!enteredGallery || !activePosters.length || !start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
    if (Math.abs(delta) < 28) return;
    event.preventDefault();
    setHasBrowsed(true);
    const direction = delta < 0 ? 1 : -1;
    setActiveIndex((current) => (current + direction + activePosters.length) % activePosters.length);
  }, [enteredGallery, activePosters.length]);

  // Up/Down arrows browse the active collection while the gallery is open.
  useEffect(() => {
    if (!enteredGallery || !activePosters.length) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName))
      ) return;

      event.preventDefault();
      setHasBrowsed(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + direction + activePosters.length) % activePosters.length);
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enteredGallery, activePosters.length]);

  const returnToCategories = useCallback((fromHistory = false) => {
    if (!enteredGallery) return;
    // Exit the gallery without changing the document scroll position. The
    // scroll-lock cleanup restores the exact position captured on entry.
    setEnteredGallery(false);
    setHasBrowsed(false);
    setActiveIndex(0);
    galleryBackStateRef.current = false;
    if (!fromHistory && typeof window !== "undefined" && window.history.state?.screenCultureGallery) {
      window.history.back();
    }
  }, [enteredGallery]);

  // Give the browser a gallery history entry so Back exits the collection first.
  useEffect(() => {
    if (!enteredGallery || typeof window === "undefined") return;
    const previousState = window.history.state ?? {};
    window.history.pushState({ ...previousState, screenCultureGallery: true }, "");
    galleryBackStateRef.current = true;
    const onPopState = () => {
      if (galleryBackStateRef.current) returnToCategories(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      galleryBackStateRef.current = false;
    };
  }, [enteredGallery, returnToCategories]);

  const headingProgress = easeOut(range(sectionProgress, 0.025, 0.27));
  const categoryReveal = easeOut(range(sectionProgress, 0.32, 0.62));
  const galleryProgress = enteredGallery ? 1 : easeOut(range(sectionProgress, 0.30, 0.56));
  const outro = easeOut(range(sectionProgress, 0.91, 1));
  const activePoster = activePosters[activeIndex] ?? null;
  const displayItems = useMemo(() => {
    if (!activePosters.length) return [];
    return Array.from({ length: Math.min(activePosters.length, 11) }, (_, slot) => {
      const offset = slot - Math.floor(Math.min(activePosters.length, 11) / 2);
      const index = (activeIndex + offset + activePosters.length) % activePosters.length;
      return { poster: activePosters[index], offset, index };
    });
  }, [activePosters, activeIndex]);

  return (
    <section
      id="beyond-the-frame"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "400svh", background: "transparent", color: "var(--portfolio-text)" }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => returnToCategories()}
        style={{ background: "transparent", isolation: "isolate" }}
      >

        <div
          ref={posterViewportRef}
          className="absolute inset-0 z-[20] h-full w-full overscroll-contain"
          style={{
            perspective: "1200px",
            overscrollBehavior: "none",
            touchAction: "none",
            pointerEvents: enteredGallery && galleryProgress > 0.02 ? "auto" : "none",
            opacity: enteredGallery ? 1 : 0,
          }}
          aria-label="Screen Culture poster gallery. Move anywhere to reveal poster trails; scroll to browse."
        >
          <div
            className="absolute inset-0"
            style={{ opacity: galleryProgress, transform: `translate3d(0, ${(1 - galleryProgress) * 110}px, 0)`, transition: "opacity 550ms ease, transform 900ms cubic-bezier(.16,1,.3,1)" }}
          >
            <div className="pointer-events-none absolute inset-0 z-[80] overflow-hidden">
              <ImageTrail
                key={`${category}-${trailPosterImages.join("|")}`}
                images={trailImagesForMode}
                imageWidth={260}
                imageHeight={340}
                threshold={50}
                duration={1.6}
              />
            </div>
            {!loading && !activePosters.length && !collectionError && (
              <div className="absolute inset-0 flex items-center justify-center px-10 text-center font-mono text-[9px] uppercase tracking-[.18em]" style={{ color: "var(--portfolio-muted)" }}>
                No published posters in this collection
              </div>
            )}
            {!!activePosters.length && (
              <div className="pointer-events-none absolute bottom-6 right-3 z-[100] rounded-full border px-4 py-2 font-mono text-[8px] uppercase tracking-[.18em] backdrop-blur-md" style={{ color: "var(--portfolio-text)", borderColor: "var(--portfolio-border)", background: "color-mix(in srgb, var(--portfolio-background) 72%, transparent)" }}>
                Move / swipe · Scroll to browse · Categories to return
              </div>
            )}
          </div>
        </div>

        {enteredGallery && activePoster && (
          <div className="pointer-events-none absolute inset-0 z-[90] flex items-center justify-center px-6 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${activePoster.id ?? activePoster.imageUrl}-${activeIndex}-${hasBrowsed ? "browsed" : "intro"}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { staggerChildren: 0.022, delayChildren: 0.04 } },
                  exit: { opacity: 0, y: -12, filter: "blur(6px)", transition: { staggerChildren: 0.01, staggerDirection: -1 } },
                }}
                className="max-w-[min(82vw,64rem)] text-center"
              >
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}
                  className="mb-4 font-mono text-[9px] uppercase tracking-[.28em]"
                  style={{ color: "var(--portfolio-accent)" }}
                >
                  {hasBrowsed
                    ? `${category === "anime" ? "Animated worlds" : "Film & television"} · ${String(activeIndex + 1).padStart(2, "0")} / ${String(activePosters.length).padStart(2, "0")}`
                    : category === "anime" ? "MORE THAN JUST SHOWS" : "MORE THAN JUST STORIES"}
                </motion.p>
                <h3 aria-label={hasBrowsed ? activePoster.title : category === "anime" ? "Anime" : "Movies and Series"} className={`${hasBrowsed ? "font-semibold text-[clamp(2.2rem,6.2vw,6.4rem)] tracking-[-.06em]" : "font-extrabold italic text-[clamp(2.8rem,8.5vw,7rem)] uppercase tracking-[-.075em] drop-shadow-[0_8px_32px_rgba(0,0,0,.55)]"} font-[Syne,sans-serif] leading-[.86] [text-wrap:balance]`}>
                  {Array.from(hasBrowsed ? activePoster.title : category === "anime" ? "ANIME" : "MOVIES & SERIES").map((character, index) => (
                    <motion.span
                      key={`${character}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 22, filter: "blur(5px)" },
                        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                        exit: { opacity: 0, y: -12, filter: "blur(4px)" },
                      }}
                      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-block"
                      style={{ color: "var(--portfolio-text)", whiteSpace: character === " " ? "pre" : undefined }}
                    >
                      {character === " " ? "\u00a0" : character}
                    </motion.span>
                  ))}
                </h3>
                {!hasBrowsed && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-5 font-mono text-[9px] uppercase tracking-[.22em] md:text-[10px]"
                    style={{ color: "var(--portfolio-muted)" }}
                  >
                    {category === "anime" ? "A passion that inspires" : "Stories that stay with us"}
                  </motion.p>
                )}
                {hasBrowsed && activePoster.description?.trim() && (
                  <motion.p
                    key={`description-${activePoster.id ?? activePoster.imageUrl}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 md:text-base"
                    style={{ color: "var(--portfolio-muted)" }}
                  >
                    {activePoster.description}
                  </motion.p>
                )}
                <AnimatePresence mode="wait">
                  {!hasBrowsed ? (
                    <motion.p
                      key="gallery-instructions"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mx-auto mt-5 max-w-md text-sm leading-6 md:text-base"
                      style={{ color: "var(--portfolio-muted)" }}
                    >
                      Move or swipe to reveal the poster trail. Scroll or swipe to browse titles; use Categories to return.
                    </motion.p>
                  ) : (
                    <motion.a
                      key={`imdb-${activePoster.id ?? activePoster.imageUrl}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      href={activePoster.imdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto mt-6 inline-flex items-center gap-3 border-b pb-2 font-mono text-[10px] uppercase tracking-[.2em] transition-opacity hover:opacity-65"
                      style={{ color: "var(--portfolio-text)", borderColor: "var(--portfolio-accent)" }}
                    >
                      View on IMDb <span aria-hidden="true">↗</span>
                    </motion.a>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {enteredGallery && (
          <button
            type="button"
            onClick={() => returnToCategories()}
            className="absolute right-6 top-7 z-[100] inline-flex items-center gap-2 border px-4 py-3 font-mono text-[9px] uppercase tracking-[.18em] backdrop-blur-md transition-colors hover:bg-white/10 md:right-10 lg:right-16"
            style={{ color: "var(--portfolio-text)", borderColor: "var(--portfolio-border)", background: "color-mix(in srgb, var(--portfolio-background) 70%, transparent)" }}
          >
            <span aria-hidden="true">←</span> Categories
          </button>
        )}

        <AnimatePresence mode="wait">
          {!enteredGallery && (
            <motion.div
              key="category-intro"
              initial={{ opacity: 0, y: 34, scale: 0.99, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -28, scale: 0.985, filter: "blur(6px)" }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[120] flex flex-col px-5 pb-7 pt-20 md:px-8 md:pb-10 md:pt-24 lg:px-12 lg:pb-12 lg:pt-24"
              style={{ background: "transparent" }}
            >
              <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
                <div>
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[.28em]" style={{ color: "var(--portfolio-accent)" }}>/ Screen culture</p>
                  <ScrollHeading text="Beyond the Frame" progress={headingProgress} />
                </div>
                <p className="hidden max-w-xs pb-1 text-right text-sm leading-6 md:block" style={{ color: "var(--portfolio-muted)", opacity: easeOut(range(sectionProgress, 0.20, 0.34)), transform: `translateY(${(1 - easeOut(range(sectionProgress, 0.20, 0.34))) * 12}px)` }}>Stories that stay with you, long after the screen fades.</p>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" style={{ pointerEvents: categoryReveal > 0.92 ? "auto" : "none" }}>
                <motion.button
                  type="button"
                  onClick={() => { setCategory("movies-series"); setActiveIndex(0); setEnteredGallery(true); }}
                  initial={false}
                  animate={{
                    opacity: categoryReveal,
                    x: (1 - categoryReveal) * -34,
                    y: (1 - categoryReveal) * 28,
                    scale: 0.97 + categoryReveal * 0.03,
                    filter: `blur(${(1 - categoryReveal) * 8}px)`,
                    clipPath: `inset(${(1 - categoryReveal) * 12}% 0 0 0)`,
                  }}
                  transition={{ duration: 0.12, ease: "linear" }}
                  className="group relative min-h-[220px] overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-accent)] md:min-h-0"
                >
                  <img src="/images/screen-culture/movies-series.png" alt="Movies and series collection" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.055]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/80" />
                  <div className="absolute inset-0 border border-white/15 transition-colors duration-500 group-hover:border-white/45" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-6 text-left md:p-8 lg:p-10">
                    <span className="mb-4 block font-mono text-[9px] uppercase tracking-[.28em] text-white/75">01 / Film &amp; television</span>
                    <span className="block max-w-[12ch] font-[Syne,sans-serif] text-[clamp(2rem,4.2vw,4.5rem)] font-semibold uppercase leading-[.88] tracking-[-.055em] text-white">Movies <span className="text-white/70">&amp;</span> Series</span>
                    <span className="mt-7 inline-flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-white/90">Explore collection <span className="transition-transform duration-300 group-hover:translate-x-2">↗</span></span>
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => { setCategory("anime"); setActiveIndex(0); setEnteredGallery(true); }}
                  initial={false}
                  animate={{
                    opacity: categoryReveal,
                    x: (1 - categoryReveal) * 34,
                    y: (1 - categoryReveal) * 28,
                    scale: 0.97 + categoryReveal * 0.03,
                    filter: `blur(${(1 - categoryReveal) * 8}px)`,
                    clipPath: `inset(${(1 - categoryReveal) * 12}% 0 0 0)`,
                  }}
                  transition={{ duration: 0.12, ease: "linear" }}
                  className="group relative min-h-[220px] overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-accent)] md:min-h-0"
                >
                  <img src="/images/screen-culture/anime.png" alt="Anime collection" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.055]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/80" />
                  <div className="absolute inset-0 border border-white/15 transition-colors duration-500 group-hover:border-white/45" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-6 text-left md:p-8 lg:p-10">
                    <span className="mb-4 block font-mono text-[9px] uppercase tracking-[.28em] text-white/75">02 / Animated worlds</span>
                    <span className="block font-[Syne,sans-serif] text-[clamp(2rem,4vw,4.5rem)] font-semibold uppercase leading-[.9] tracking-[-.05em] text-white">Anime<span className="text-white/70">.</span></span>
                    <span className="mt-7 inline-flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-white/90">Enter another world <span className="transition-transform duration-300 group-hover:translate-x-2">↗</span></span>
                  </div>
                </motion.button>
              </div>
              <motion.div initial={false} animate={{ opacity: categoryReveal, y: (1 - categoryReveal) * 10 }} transition={{ duration: 0.12, ease: "linear" }} className="mt-5 flex items-center justify-between font-mono text-[8px] uppercase tracking-[.2em] md:mt-6" style={{ color: "var(--portfolio-muted)" }}><span>Two worlds · One screen</span><span>Choose a world ↘</span></motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`pointer-events-none absolute bottom-6 left-6 z-[70] md:left-10 lg:left-16 transition-opacity duration-500 ${enteredGallery ? "opacity-100" : "opacity-0"}`} style={{ opacity: outro, transform: `translateY(${(1 - outro) * 12}px)` }}>
          <span className="font-mono text-[8px] uppercase tracking-[.24em]" style={{ color: "var(--portfolio-muted)" }}>
            {activePosters.length ? `${String(activeIndex + 1).padStart(2, "0")} / ${String(activePosters.length).padStart(2, "0")} — Select a frame` : "The journey ahead"}
          </span>
        </div>
      </div>
    </section>
  );
}
