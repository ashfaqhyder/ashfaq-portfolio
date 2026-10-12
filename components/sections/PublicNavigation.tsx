"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NavItem = {
  label: string;
  target: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "ABOUT", target: "about" },
  { label: "EXPERIENCE", target: "experience" },
  { label: "WORK", target: "projects" },
  { label: "ACHIEVEMENTS", target: "achievements" },
  { label: "SKILLS", target: "skills" },
  { label: "PHOTOGRAPHY", target: "photography" },
  { label: "BEYOND THE FRAME", target: "beyond-the-frame" },
  { label: "CONTACT", target: "contact" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const easeOut = (value: number) => {
  const t = clamp(value, 0, 1);
  return 1 - Math.pow(1 - t, 3);
};

export default function PublicNavigation() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number | null>(null);

  const itemCount = NAV_ITEMS.length;

  const itemStyles = useMemo(
    () =>
      NAV_ITEMS.map((_, index) => ({
        baseScale: 1,
        distanceRadius: 125,
        maxScale: index === hoveredIndex ? 1.16 : 1.08,
      })),
    [hoveredIndex]
  );

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      const hero = document.querySelector("main > section");

      if (hero instanceof HTMLElement) {
        setVisible(hero.getBoundingClientRect().bottom <= 0);
      } else {
        setVisible(window.scrollY >= window.innerHeight);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    updateVisibility();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * 0.34, 260);
      const sections = NAV_ITEMS
        .map(({ target }) => {
          const element = resolveSection(target);
          return element ? { target, element } : null;
        })
        .filter(
          (item): item is { target: string; element: HTMLElement } =>
            item !== null
        );

      if (!sections.length) return;

      let current = sections[0].target;
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= readingLine) {
          current = section.target;
        } else {
          break;
        }
      }
      setActiveSection(current);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function resolveSection(target: string): HTMLElement | null {
    const direct = document.getElementById(target);
    if (direct) return direct;

    if (target === "creative-lab") {
      return (
        document.getElementById("beyond-the-codes") ??
        document.getElementById("digital-lab")
      );
    }
    if (target === "beyond-the-frame") {
      return document.getElementById("beyondTheFrame");
    }
    return null;
  }

  function navigateTo(target: string) {
    const section = resolveSection(target);
    if (!section) return;

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const top =
      section.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setActiveSection(target);
  }

  function resetMagneticItems() {
    itemRefs.current.forEach((item) => {
      if (!item) return;

      item.style.transform = "translate3d(0, 0, 0) scale(1)";
      item.style.setProperty("--nav-distance", "0");
      item.style.setProperty("--nav-scale", "1");
    });
  }

  function updateMagneticPosition(clientX: number, clientY: number) {
    pointer.current = {
      x: clientX,
      y: clientY,
      active: true,
    };

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const maxDistance = 130;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = pointer.current.x - centerX;
        const dy = pointer.current.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
          item.style.transform = "translate3d(0, 0, 0) scale(1)";
          item.style.setProperty("--nav-distance", "0");
          item.style.setProperty("--nav-scale", "1");
          return;
        }

        const influence = easeOut(1 - distance / maxDistance);
        const translateX = dx * 0.13 * influence;
        const translateY = dy * 0.08 * influence;
        const scale = 1 + 0.15 * influence;

        item.style.transform = `translate3d(${translateX.toFixed(
          2
        )}px, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        item.style.setProperty(
          "--nav-distance",
          influence.toFixed(3)
        );
        item.style.setProperty("--nav-scale", scale.toFixed(3));
      });
    });
  }

  function handleNavPointerMove(event: React.PointerEvent<HTMLElement>) {
    updateMagneticPosition(event.clientX, event.clientY);
  }

  function handleNavPointerLeave() {
    pointer.current.active = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    resetMagneticItems();
    setHoveredIndex(null);
  }

  return (
    <nav
      ref={navRef}
      aria-label="Primary navigation"
      onPointerMove={handleNavPointerMove}
      onPointerLeave={handleNavPointerLeave}
      className={`fixed left-1/2 top-0 z-[100] -translate-x-1/2 transition-[transform,opacity] duration-[900ms] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[calc(100%+18px)] pointer-events-none opacity-0"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity",
      }}
    >
      <div
        className="
          relative flex items-center
          rounded-b-[22px]
          border-x border-b border-white/[0.10]
          bg-white/[0.055]
          px-2 py-2
          shadow-[0_18px_60px_rgba(0,0,0,0.34)]
          backdrop-blur-2xl
          backdrop-saturate-150
          md:rounded-b-[24px]
          md:px-2.5 md:py-2.5
        "
      >
        {/* Existing glass treatment retained. */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.22] to-transparent" />
        <div className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-24 -translate-x-1/2 rounded-b-full bg-black/20 blur-md" />

        <div className="flex items-center gap-0.5 md:gap-1">
          {NAV_ITEMS.map((item, index) => {
            const active = activeSection === item.target;
            const hovered = hoveredIndex === index;

            return (
              <button
                key={item.target}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                onClick={() => navigateTo(item.target)}
                onPointerEnter={() => setHoveredIndex(index)}
                aria-current={active ? "page" : undefined}
                className="
                  group relative flex h-9 items-center
                  rounded-[14px]
                  px-3
                  text-[9px] font-medium tracking-[0.18em]
                  text-neutral-500
                  focus:outline-none
                  focus-visible:ring-1 focus-visible:ring-white/30
                  md:h-10 md:px-3.5 md:text-[10px]
                "
                style={{
                  transformOrigin: "center center",
                  willChange: "transform",
                  transition:
                    "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), color 240ms ease, background-color 240ms ease",
                  color: active || hovered
                    ? "var(--portfolio-text)"
                    : "var(--portfolio-muted)",
                  background:
                    active || hovered
                      ? "rgba(255,255,255,0.055)"
                      : "transparent",
                }}
              >
                <span className="relative z-10 whitespace-nowrap">
                  {item.label}
                </span>

                {/* Active / hover underline. */}
                <span
                  className="pointer-events-none absolute bottom-[5px] left-1/2 h-px -translate-x-1/2"
                  style={{
                    width: active ? 14 : hovered ? 9 : 0,
                    opacity: active ? 1 : hovered ? 0.6 : 0,
                    background: "var(--portfolio-accent)",
                    transition:
                      "width 280ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease",
                  }}
                />

                {/* Subtle glass highlight around the active/hovered item. */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-[14px]"
                  style={{
                    opacity: active || hovered ? 1 : 0,
                    boxShadow: active
                      ? "inset 0 0 0 1px rgba(255,255,255,0.055), 0 0 24px rgba(182,255,59,0.025)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.035)",
                    transition: "opacity 240ms ease",
                  }}
                />

                {/* Small active marker, kept intentionally restrained. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full"
                  style={{
                    width: active ? 3 : 0,
                    opacity: active ? 0.9 : 0,
                    background: "var(--portfolio-accent)",
                    transition:
                      "width 280ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
