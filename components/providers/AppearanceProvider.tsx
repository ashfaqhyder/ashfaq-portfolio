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

    applyVariable(
      "--portfolio-surface",
      settings.surfaceColor
    );

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

    root.dataset.smoothScroll =
      settings.smoothScrollEnabled
        ? "enabled"
        : "disabled";

    body.dataset.portfolioPublic =
      "true";

    body.style.backgroundColor =
      settings.backgroundColor;

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

      delete body.dataset.portfolioPublic;
    };
  }, [settings, isAdmin]);

  return (
    <div
      data-portfolio-public="true"
      style={
        {
          "--portfolio-background":
            settings.backgroundColor,

          "--portfolio-surface":
            settings.surfaceColor,

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