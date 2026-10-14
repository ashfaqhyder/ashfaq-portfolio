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

    body.style.backgroundColor = settings.backgroundColor;
    body.style.backgroundImage = getBackgroundImage(settings);
    body.style.backgroundSize = settings.backgroundMode === "texture" ? (settings.textureStyle === "dots" ? "14px 14px" : "28px 28px, 28px 28px") : "cover";

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
      body.style.backgroundImage = "";
      body.style.backgroundSize = "";
    };
  }, [settings, isAdmin]);

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