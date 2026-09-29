"use client";

import { useEffect, useState } from "react";
import AnimatedText from "@/components/motion/AnimatedText";
import ScrollReveal from "@/components/motion/ScrollReveal";

import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
} from "@/services/homepage";

export default function Introduction() {
  const [settings, setSettings] =
    useState<HomepageSettings>(
      defaultHomepageSettings
    );

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getHomepageSettings();
        setSettings(data);
      } catch (error) {
        console.error(
          "Failed to load introduction:",
          error
        );
      }
    }

    loadSettings();
  }, []);

  return (
    <section className="border-t border-neutral-900 px-6 py-20 md:px-10 lg:px-16 lg:py-28 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: "1s"}}></div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_2fr] md:gap-12">

        <ScrollReveal direction="left">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-600 group">
            {settings.introLabel}
            <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 ml-2 group-hover:w-12 transition-all duration-300"></span>
          </p>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div>
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <AnimatedText delay={0.2}>
                {settings.introTitle}
              </AnimatedText>
              {" "}

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                <AnimatedText delay={0.4}>
                  {settings.introAccent}
                </AnimatedText>
              </span>
            </h2>

            <div className="mt-7 max-w-2xl">
              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-sm leading-7 text-neutral-500 md:text-base hover:text-neutral-400 transition-colors duration-300">
                  {settings.introDescription}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}