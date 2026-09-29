"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";
import styles from "./ScenePortfolio.module.css";

gsap.registerPlugin(Observer);

type ScenePortfolioProps = { scenes: ReactNode[] };

type Rect = { x: number; y: number; width: number; height: number };

const NAV = [
  { label: "Work", index: 4 },
  { label: "About", index: 2 },
  { label: "Experience", index: 3 },
  { label: "Skills", index: 6 },
  { label: "Lab", index: 7 },
  { label: "Contact", index: 10 },
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export default function ScenePortfolio({ scenes }: ScenePortfolioProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitImageRef = useRef<HTMLImageElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const avatarTargetRef = useRef<HTMLAnchorElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [activeScene, setActiveScene] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [homepage, setHomepage] = useState<HomepageSettings>(defaultHomepageSettings);

  const totalScenes = scenes.length + 2;
  const contactIndex = totalScenes - 1;

  const setSceneRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      sceneRefs.current[index] = node;
    },
    []
  );

  const setContentRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      contentRefs.current[index] = node;
    },
    []
  );

  useEffect(() => {
    let alive = true;
    getHomepageSettings()
      .then((data) => {
        if (alive) setHomepage(data);
      })
      .catch((error) => console.error("Failed to load homepage settings:", error));
    return () => {
      alive = false;
    };
  }, []);

  const getHeroRect = useCallback(() => {
    const mobile = window.innerWidth < 768;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: mobile ? vw * 0.67 : vw * 0.65,
      y: mobile ? vh * 0.53 : vh * 0.53,
      width: mobile ? vw * 0.72 : Math.min(vw * 0.58, 900),
      height: mobile ? vh * 0.72 : Math.min(vh * 0.92, 820),
      imageScale: mobile ? 1.02 : 1.02,
      radius: mobile
        ? "42% 58% 54% 46% / 35% 38% 62% 65%"
        : "20% 32% 26% 38% / 30% 26% 38% 24%",
    };
  }, []);

  const getAvatarRect = useCallback((): Rect | null => {
    const target = avatarTargetRef.current;
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const setHeroPortrait = useCallback(() => {
    const portrait = portraitRef.current;
    const image = portraitImageRef.current;
    if (!portrait || !image) return;
    const r = getHeroRect();
    gsap.set(portrait, {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      scale: 1,
      borderRadius: r.radius,
      clipPath: "ellipse(50% 50% at 50% 46%)",
      opacity: 1,
    });
    gsap.set(image, {
      xPercent: 0,
      yPercent: 0,
      scale: r.imageScale,
      transformOrigin: "50% 42%",
    });
  }, [getHeroRect]);

  const setNavPortrait = useCallback(() => {
    const portrait = portraitRef.current;
    const image = portraitImageRef.current;
    const target = getAvatarRect();
    if (!portrait || !image || !target) return;
    gsap.set(portrait, {
      x: target.x,
      y: target.y,
      width: target.width,
      height: target.height,
      scale: 1,
      borderRadius: "50%",
      clipPath: "circle(50% at 50% 50%)",
      opacity: 1,
    });
    gsap.set(image, {
      xPercent: -2,
      yPercent: -8,
      scale: 2.05,
      transformOrigin: "50% 38%",
    });
  }, [getAvatarRect]);

  const transitionPortraitToNav = useCallback(async () => {
    const portrait = portraitRef.current;
    const image = portraitImageRef.current;
    const target = getAvatarRect();
    if (!portrait || !image || !target) return;
    if (reducedMotionRef.current) {
      setNavPortrait();
      return;
    }

    const r = getHeroRect();
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(portrait, {
        duration: 0.18,
        scale: 0.965,
        ease: "power2.out",
      })
        .to(
          heroCopyRef.current,
          { duration: 0.32, x: -28, y: -22, autoAlpha: 0, ease: "power3.inOut" },
          "<"
        )
        .to(
          portrait,
          {
            duration: 0.42,
            x: r.x + (target.x - r.x) * 0.38,
            y: r.y - window.innerHeight * 0.12,
            width: r.width * 0.72,
            height: r.height * 0.74,
            borderRadius: "34% 48% 38% 52% / 38% 34% 52% 44%",
            clipPath: "ellipse(45% 46% at 50% 45%)",
            ease: "power3.inOut",
          },
          "<"
        )
        .to(
          image,
          {
            duration: 0.42,
            scale: 1.36,
            xPercent: -1,
            yPercent: -4,
            ease: "power3.inOut",
          },
          "<"
        )
        .to(
          portrait,
          {
            duration: 0.46,
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            borderRadius: "50%",
            clipPath: "circle(50% at 50% 50%)",
            scale: 1,
            ease: "cubic-bezier(0.22,1,0.36,1)",
          },
          "-=0.08"
        )
        .to(
          image,
          {
            duration: 0.46,
            scale: 2.05,
            xPercent: -2,
            yPercent: -8,
            ease: "cubic-bezier(0.22,1,0.36,1)",
          },
          "<"
        )
        .to(navRef.current, { duration: 0.38, autoAlpha: 1, y: 0, ease: "power3.out" }, "-=0.22")
        .to(portrait, { duration: 0.10, x: target.x + 2, ease: "power2.out" })
        .to(portrait, { duration: 0.12, x: target.x, ease: "power2.out" });
    });
  }, [getAvatarRect, getHeroRect, setNavPortrait]);

  const transitionPortraitToHero = useCallback(async () => {
    const portrait = portraitRef.current;
    const image = portraitImageRef.current;
    if (!portrait || !image) return;
    const r = getHeroRect();
    if (reducedMotionRef.current) {
      setHeroPortrait();
      gsap.set(heroCopyRef.current, { autoAlpha: 1, x: 0, y: 0 });
      return;
    }
    gsap.set(heroCopyRef.current, { autoAlpha: 0, x: -28, y: -22 });
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(navRef.current, { duration: 0.24, autoAlpha: 0, y: -10, ease: "power2.in" })
        .to(portrait, {
          duration: 0.26,
          scale: 0.965,
          ease: "power2.inOut",
        })
        .to(
          portrait,
          {
            duration: 0.54,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            borderRadius: r.radius,
            clipPath: "ellipse(50% 50% at 50% 46%)",
            scale: 1,
            ease: "power3.inOut",
          },
          "<"
        )
        .to(
          image,
          {
            duration: 0.54,
            xPercent: 0,
            yPercent: 0,
            scale: r.imageScale,
            ease: "power3.inOut",
          },
          "<"
        )
        .to(heroCopyRef.current, { duration: 0.42, autoAlpha: 1, x: 0, y: 0, ease: "power3.out" }, "-=0.20");
    });
  }, [getHeroRect, setHeroPortrait]);

  const fitContent = useCallback((index: number) => {
    const content = contentRefs.current[index];
    if (!content || index === 0) return;

    // Do not shrink sections to force them into the viewport.
    // Each scene remains full-screen, while its content can scroll
    // vertically when the content is taller than the scene.
    gsap.set(content, {
      scale: 1,
      transformOrigin: "50% 50%",
    });
  }, []);

  const goTo = useCallback(
    async (requestedIndex: number) => {
      const nextIndex = clamp(requestedIndex, 0, totalScenes - 1);
      if (!mountedRef.current || busyRef.current || nextIndex === activeRef.current) return;
      const previous = activeRef.current;
      const direction = nextIndex > previous ? 1 : -1;
      const currentEl = sceneRefs.current[previous];
      const nextEl = sceneRefs.current[nextIndex];
      if (!nextEl) return;

      busyRef.current = true;
      setMenuOpen(false);
      fitContent(nextIndex);

      const tl = gsap.timeline({
        onComplete: () => {
          activeRef.current = nextIndex;
          setActiveScene(nextIndex);
          busyRef.current = false;
        },
      });

      if (reducedMotionRef.current) {
        gsap.set(currentEl, { autoAlpha: 0, x: 0, y: 0 });
        gsap.set(nextEl, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)" });
      } else {
        gsap.set(nextEl, {
          autoAlpha: 1,
          x: direction * 8,
          y: direction > 0 ? 24 : -24,
          scale: 0.985,
          filter: "blur(9px)",
        });
        tl.to(
          currentEl,
          { duration: 0.46, x: -direction * 7, y: -direction * 12, autoAlpha: 0, filter: "blur(8px)", ease: "power3.inOut" },
          0
        ).to(
          nextEl,
          { duration: 0.78, x: 0, y: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)", ease: "power3.out" },
          0.10
        );
      }

      if (previous === 0 && nextIndex !== 0) {
        await transitionPortraitToNav();
      }
      if (previous !== 0 && nextIndex === 0) {
        await transitionPortraitToHero();
      }
    },
    [fitContent, totalScenes, transitionPortraitToHero, transitionPortraitToNav]
  );

  useLayoutEffect(() => {
    mountedRef.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = reduce.matches;

    const updateReduced = () => {
      reducedMotionRef.current = reduce.matches;
    };
    reduce.addEventListener?.("change", updateReduced);

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyHeight = document.body.style.height;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";

    const ctx = gsap.context(() => {
      sceneRefs.current.forEach((scene, index) => {
        if (!scene) return;
        gsap.set(scene, {
          autoAlpha: index === 0 ? 1 : 0,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        });
      });
      gsap.set(navRef.current, { autoAlpha: 0, y: -10 });
      setHeroPortrait();
      fitContent(1);

      let wheelLocked = false;
      const trigger = (delta: number) => {
        if (wheelLocked || Math.abs(delta) < 48) return;
        wheelLocked = true;
        void goTo(activeRef.current + (delta > 0 ? 1 : -1));
        window.setTimeout(() => {
          wheelLocked = false;
        }, reducedMotionRef.current ? 150 : 1050);
      };

      const canScrollInsideScene = (delta: number) => {
        const index = activeRef.current;
        if (index === 0) return false;

        const content = contentRefs.current[index];
        if (!content) return false;

        const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight);
        if (maxScroll <= 2) return false;

        const atTop = content.scrollTop <= 1;
        const atBottom = content.scrollTop >= maxScroll - 1;

        if (delta > 0) return !atBottom;
        return !atTop;
      };

      const handleGesture = (delta: number, event?: Event) => {
        if (Math.abs(delta) < 48 || busyRef.current) return;

        // Let the active scene consume the gesture while it still has
        // internal content to scroll. Only the boundary gesture changes scene.
        if (canScrollInsideScene(delta)) return;

        event?.preventDefault();
        trigger(delta);
      };

      const observer = Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        tolerance: 32,
        wheelSpeed: 1,
        dragMinimum: 18,
        lockAxis: true,
        preventDefault: false,
        onWheel: (self) => handleGesture(self.deltaY, self.event),
        onChangeY: (self) => {
          if (self.event instanceof WheelEvent) return;
          handleGesture(-self.deltaY, self.event);
        },
      });

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
          event.preventDefault();
          void goTo(activeRef.current + 1);
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
          event.preventDefault();
          void goTo(activeRef.current - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          void goTo(0);
        } else if (event.key === "End") {
          event.preventDefault();
          void goTo(contactIndex);
        } else if (event.key === "Escape") {
          setMenuOpen(false);
        }
      };

      const onResize = () => {
        if (activeRef.current === 0) setHeroPortrait();
        else setNavPortrait();
        for (let i = 1; i < totalScenes; i += 1) fitContent(i);
      };

      const resizeObserver = typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            for (let i = 1; i < totalScenes; i += 1) fitContent(i);
          })
        : null;

      contentRefs.current.forEach((node) => {
        if (node) resizeObserver?.observe(node);
      });

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", onResize);

      return () => {
        observer.kill();
        resizeObserver?.disconnect();
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        reduce.removeEventListener?.("change", updateReduced);
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.height = previousBodyHeight;
      };
    }, rootRef);

    return () => {
      mountedRef.current = false;
      ctx.revert();
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.height = previousBodyHeight;
    };
  }, [contactIndex, fitContent, goTo, setHeroPortrait, setNavPortrait, totalScenes]);

  const heroVisible = activeScene === 0;
  const progress = (activeScene + 1) / totalScenes;

  return (
    <main ref={rootRef} className={styles.root} id="top">
      <div className={styles.canvas}>
        <div className={styles.grain} aria-hidden="true" />
        <div ref={heroRef} className={styles.heroLayer} aria-hidden={!heroVisible}>
          <div ref={heroCopyRef} className={styles.heroCopy}>
            <p className={`${styles.eyebrow} ${styles.heroAnimate}`}>{homepage.heroEyebrow}</p>
            <h1 className={`${styles.heroTitle} ${styles.heroAnimate}`}>
              <span>{homepage.heroTitle}</span>
              <span>{homepage.heroTitleAccent}</span>
            </h1>
            <p className={`${styles.heroRole} ${styles.heroAnimate}`}>&amp; AI/ML Enthusiast</p>
            <p className={`${styles.heroDescription} ${styles.heroAnimate}`}>{homepage.heroDescription}</p>
            <button type="button" className={`${styles.heroCta} ${styles.heroAnimate}`} onClick={() => void goTo(NAV[0].index)}>
              <span>{homepage.heroCta}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div ref={portraitRef} className={styles.portrait} aria-hidden="true">
          <img ref={portraitImageRef} src="/images/portraits/ashfaq-hero-portrait.png" alt="" draggable={false} />
          <span className={styles.portraitFalloff} />
        </div>

        <nav ref={navRef} className={styles.nav} aria-label="Primary navigation">
          <a ref={avatarTargetRef} href="#top" className={styles.avatarTarget} aria-label="Home">AH</a>
          <div className={styles.navLinks}>
            {NAV.filter((item) => item.index < totalScenes).map((item) => (
              <button key={item.label} type="button" onClick={() => void goTo(item.index)}>{item.label}</button>
            ))}
          </div>
        </nav>

        <div className={styles.mobileMenuButtonWrap}>
          <button type="button" className={styles.mobileMenuButton} onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="portfolio-mobile-menu">
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div id="portfolio-mobile-menu" className={styles.mobileMenu}>
            {NAV.filter((item) => item.index < totalScenes).map((item) => (
              <button key={item.label} type="button" onClick={() => void goTo(item.index)}>{item.label}</button>
            ))}
          </div>
        )}

        {Array.from({ length: totalScenes }).map((_, index) => {
          const content = index === 0 ? null : index === contactIndex ? <ContactScene /> : scenes[index - 1];
          return (
            <section
              key={index}
              ref={setSceneRef(index)}
              className={`${styles.scene} ${index === 0 ? styles.heroScene : styles.contentScene}`}
              aria-hidden={activeScene !== index}
            >
              {index === 0 ? null : (
                <div ref={setContentRef(index)} className={styles.sceneContent}>
                  <div className={styles.sceneIndex}>{String(index).padStart(2, "0")} / {String(totalScenes - 1).padStart(2, "0")}</div>
                  {content}
                </div>
              )}
            </section>
          );
        })}

        <div className={styles.progress} aria-hidden="true">
          <span>{String(activeScene + 1).padStart(2, "0")}</span>
          <span className={styles.progressLine}><i style={{ transform: `scaleX(${progress})` }} /></span>
          <span>{String(totalScenes).padStart(2, "0")}</span>
        </div>
        <div className={styles.sceneHint} aria-hidden="true">{heroVisible ? "Scroll / swipe to enter" : "Scroll / swipe to explore"}</div>
      </div>
    </main>
  );
}

function ContactScene() {
  const [settings, setSettings] = useState<HomepageSettings>(defaultHomepageSettings);

  useEffect(() => {
    let alive = true;
    getHomepageSettings()
      .then((data) => {
        if (alive) setSettings(data);
      })
      .catch((error) => console.error("Failed to load contact settings:", error));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className={styles.contactScene} id="contact">
      <div className={styles.contactMeta}>
        <span>{settings.contactLabel}</span>
        <span className={styles.desktopOnly}>AVAILABLE FOR SELECTED WORK</span>
      </div>
      <div className={styles.contactMain}>
        <h2>{settings.contactTitle}<br /><span>{settings.contactAccent}</span></h2>
        <div className={styles.contactBottom}>
          <p>Have an idea, project, or experiment in mind? Let&apos;s turn it into something meaningful.</p>
          <a href={`mailto:${settings.contactEmail}`}>
            <span>{settings.contactCta}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
