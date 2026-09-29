"use client";

import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  target: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "WORK", target: "projects" },
  { label: "ABOUT", target: "about" },
  { label: "EXPERIENCE", target: "experience" },
  { label: "ACHIEVEMENTS", target: "achievements" },
  { label: "SKILLS", target: "skills" },
  { label: "CREATIVE", target: "creative-lab" },
  { label: "PHOTOGRAPHY", target: "photography" },
  { label: "CONTACT", target: "contact" },
];

export default function PublicNavigation() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");

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
    const sections = NAV_ITEMS.map(({ target }) =>
      document.getElementById(target)
    ).filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target instanceof HTMLElement) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  function navigateTo(target: string) {
    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed left-1/2 top-0 z-[100] -translate-x-1/2 transition-[transform,opacity] duration-[900ms] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[calc(100%+18px)] opacity-0 pointer-events-none"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity",
      }}
    >
      <div
        className="
          relative
          flex
          items-center
          rounded-b-[22px]
          border-x
          border-b
          border-white/[0.10]
          bg-white/[0.055]
          px-2
          py-2
          shadow-[0_18px_60px_rgba(0,0,0,0.34)]
          backdrop-blur-2xl
          backdrop-saturate-150
          md:rounded-b-[24px]
          md:px-2.5
          md:py-2.5
        "
      >
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.22] to-transparent" />

        <div className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-24 -translate-x-1/2 rounded-b-full bg-black/20 blur-md" />

        <div className="flex items-center gap-0.5 md:gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.target;

            return (
              <button
                key={item.target}
                type="button"
                onClick={() => navigateTo(item.target)}
                aria-current={active ? "page" : undefined}
                className="
                  group
                  relative
                  flex
                  h-9
                  items-center
                  rounded-[14px]
                  px-3
                  text-[9px]
                  font-medium
                  tracking-[0.18em]
                  text-neutral-500
                  transition-all
                  duration-300
                  hover:bg-white/[0.055]
                  hover:text-white
                  focus:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-white/30
                  md:h-10
                  md:px-3.5
                  md:text-[10px]
                "
              >
                <span className="relative z-10 whitespace-nowrap">
                  {item.label}
                </span>

                <span
                  className={`absolute bottom-[5px] left-1/2 h-px -translate-x-1/2 bg-[var(--portfolio-accent)] transition-all duration-400 ${
                    active
                      ? "w-3 opacity-100"
                      : "w-0 opacity-0 group-hover:w-2 group-hover:opacity-60"
                  }`}
                />

                <span
                  className={`pointer-events-none absolute inset-0 rounded-[14px] transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    boxShadow: active
                      ? "inset 0 0 0 1px rgba(255,255,255,0.055), 0 0 24px rgba(182,255,59,0.025)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.035)",
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