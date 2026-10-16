"use client";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  AppearanceSettings,
  defaultAppearanceSettings,
} from "@/services/appearance";

function getBackgroundImage(settings: AppearanceSettings) {
  const opacity = Math.max(0, Math.min(0.35, settings.textureOpacity));
  const texture = settings.textureStyle === "dots"
    ? `radial-gradient(color-mix(in srgb, var(--portfolio-text) ${opacity * 100}%, transparent) 1px, transparent 1.2px)`
    : settings.textureStyle === "noise"
      ? `repeating-radial-gradient(circle at 0 0, color-mix(in srgb, var(--portfolio-text) ${opacity * 100}%, transparent) 0, transparent 1px, transparent 3px)`
      : `linear-gradient(color-mix(in srgb, var(--portfolio-text) ${opacity * 100}%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--portfolio-text) ${opacity * 100}%, transparent) 1px, transparent 1px)`;
  if (settings.backgroundMode === "linear-gradient") return `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart}, ${settings.gradientEnd})`;
  if (settings.backgroundMode === "radial-gradient") return `radial-gradient(ellipse at top, ${settings.gradientStart}, ${settings.gradientEnd})`;
  if (settings.backgroundMode === "texture") return texture;
  return "none";
}
function getSurfaceBackground(settings: AppearanceSettings) {
  return settings.surfaceMode === "linear-gradient"
    ? `linear-gradient(135deg, ${settings.surfaceGradientStart}, ${settings.surfaceGradientEnd})`
    : settings.surfaceColor;
}

export default function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin =
    pathname.startsWith("/admin");

  const [settings, setSettings] =
    useState<AppearanceSettings>(
      defaultAppearanceSettings
    );

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    let cancelled = false;

    async function loadAppearance() {
      try {
        const response = await fetch(
          "/api/admin/appearance",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Appearance API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (
          !result ||
          !result.settings
        ) {
          throw new Error(
            "Appearance API returned invalid data."
          );
        }

        if (!cancelled) {
          const loadedSettings =
            {
              ...defaultAppearanceSettings,
              ...result.settings,
            };

          setSettings(
            loadedSettings
          );
        }
      } catch (error) {
        console.error(
          "Failed to load Appearance settings:",
          error
        );
      }
    }

    loadAppearance();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const root =
      document.documentElement;

    const body =
      document.body;

    const applyVariable = (
      name: string,
      value: string
    ) => {
      root.style.setProperty(
        name,
        value
      );

      body.style.setProperty(
        name,
        value
      );
    };

    applyVariable(
      "--portfolio-background",
      settings.backgroundColor
    );

    applyVariable("--portfolio-surface", settings.surfaceColor);
    applyVariable("--portfolio-surface-background", getSurfaceBackground(settings));

    applyVariable(
      "--portfolio-text",
      settings.textColor
    );

    applyVariable(
      "--portfolio-muted",
      settings.mutedColor
    );

    applyVariable(
      "--portfolio-border",
      settings.borderColor
    );

    applyVariable(
      "--portfolio-accent",
      settings.accentColor
    );

    root.dataset.animations =
      settings.animationsEnabled
        ? "enabled"
        : "disabled";

    root.dataset.ditherBackground =
      settings.ditherBackgroundEnabled
        ? "enabled"
        : "disabled";

    root.dataset.smoothScroll =
      settings.smoothScrollEnabled
        ? "enabled"
        : "disabled";

    body.dataset.portfolioPublic =
      "true";

    const backgroundImage = getBackgroundImage(settings);
    const backgroundSize = settings.backgroundMode === "texture"
      ? (settings.textureStyle === "dots" ? "14px 14px" : "28px 28px, 28px 28px")
      : "cover";
    const backgroundRepeat = settings.backgroundMode === "texture" ? "repeat" : "no-repeat";
    const backgroundPosition = "center center";
    const backgroundAttachment = window.matchMedia("(max-width: 767px)").matches ? "scroll" : "fixed";
    root.style.setProperty("--portfolio-background-image", backgroundImage);
    root.style.setProperty("--portfolio-background-size", backgroundSize);
    root.style.setProperty("--portfolio-background-position", backgroundPosition);
    root.style.setProperty("--portfolio-background-repeat", backgroundRepeat);
    root.style.backgroundColor = settings.backgroundColor;
    root.style.backgroundImage = backgroundImage;
    root.style.backgroundSize = backgroundSize;
    root.style.backgroundPosition = backgroundPosition;
    root.style.backgroundRepeat = backgroundRepeat;
    root.style.backgroundAttachment = backgroundAttachment;

    /* The body must stay transparent; painting the same gradient on both root
       and body makes it look doubled and drift while the document scrolls. */
    body.style.backgroundColor = "transparent";
    body.style.backgroundImage = "none";
    body.style.backgroundAttachment = "scroll";

    body.style.color =
      settings.textColor;

    if (
      settings.smoothScrollEnabled
    ) {
      root.style.scrollBehavior =
        "smooth";
    } else {
      root.style.scrollBehavior =
        "auto";
    }

    return () => {
      root.style.scrollBehavior =
        "auto";

      delete root.dataset.animations;
      delete root.dataset.smoothScroll;
      delete root.dataset.ditherBackground;

      delete body.dataset.portfolioPublic;
      for (const element of [root, body]) {
        element.style.removeProperty("--portfolio-background-image");
        element.style.removeProperty("--portfolio-background-size");
        element.style.removeProperty("--portfolio-background-position");
        element.style.removeProperty("--portfolio-background-repeat");
        element.style.backgroundImage = "";
        element.style.backgroundSize = "";
        element.style.backgroundPosition = "";
        element.style.backgroundRepeat = "";
        element.style.backgroundAttachment = "";
        element.style.backgroundColor = "";
      }
    };
  }, [settings, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const root = document.documentElement;
    const body = document.body;
    const syncBackgroundAttachment = () => {
      const attachment = window.matchMedia("(max-width: 767px)").matches ? "scroll" : "fixed";
      root.style.backgroundAttachment = attachment;
      body.style.backgroundAttachment = attachment;
    };
    syncBackgroundAttachment();
    window.addEventListener("resize", syncBackgroundAttachment, { passive: true });
    return () => window.removeEventListener("resize", syncBackgroundAttachment);
  }, [isAdmin]);

  return (
    <div
      className="relative z-10"
      data-portfolio-public="true"
      style={
        {
          "--portfolio-background":
            settings.backgroundColor,

          "--portfolio-surface": settings.surfaceColor,
          "--portfolio-surface-background": getSurfaceBackground(settings),

          "--portfolio-text":
            settings.textColor,

          "--portfolio-muted":
            settings.mutedColor,

          "--portfolio-border":
            settings.borderColor,

          "--portfolio-accent":
            settings.accentColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}