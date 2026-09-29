"use client";

import { useEffect, useState } from "react";
import AnimatedText from "@/components/motion/AnimatedText";
import ScrollReveal from "@/components/motion/ScrollReveal";
import HoverTilt from "@/components/motion/HoverTilt";

import {
  AboutSettings,
  defaultAboutSettings,
  getAboutSettings,
} from "@/services/about";

export default function About() {
  const [settings, setSettings] =
    useState<AboutSettings>(defaultAboutSettings);

  useEffect(() => {
    async function loadAbout() {
      try {
        const data = await getAboutSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load About content:", error);
      }
    }

    loadAbout();
  }, []);

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-neutral-900 bg-black px-6 py-20 text-white md:px-10 md:py-28 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="mb-14 flex flex-col gap-5 md:mb-20 md:flex-row md:items-start md:justify-between">
          <ScrollReveal direction="left">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 group">
              {settings.eyebrow}
              <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 ml-2 group-hover:w-12 transition-all duration-300"></span>
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <p className="max-w-md text-sm leading-6 text-neutral-500">
              {settings.shortBio}
            </p>
          </ScrollReveal>
        </div>

        {/* Main About */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">

          {/* Left */}
          <ScrollReveal direction="left" delay={0.2}>
            <div>
              <h2 className="max-w-5xl text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                <AnimatedText delay={0.3}>
                  {settings.title}
                </AnimatedText>
                {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  <AnimatedText delay={0.5}>
                    {settings.titleAccent}
                  </AnimatedText>
                </span>
              </h2>

              <div className="mt-8 max-w-2xl">
                <p className="text-base leading-8 text-neutral-400 md:text-lg hover:text-neutral-300 transition-colors duration-300">
                  {settings.biography}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right */}
          <ScrollReveal direction="right" delay={0.3}>
            <div className="flex flex-col">

              {/* Profile Image */}
              {settings.profileImageUrl && (
                <HoverTilt intensity={0.03}>
                  <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors duration-300">
                    <img
                      src={settings.profileImageUrl}
                      alt="Ashfaq Hyder"
                      className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105"
                    />
                  </div>
                </HoverTilt>
              )}

              {/* Details */}
              <div className="border-t border-neutral-800">

                <div className="grid grid-cols-[110px_1fr] gap-6 border-b border-neutral-800 py-4 hover:border-neutral-700 transition-colors duration-300">
                  <span className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                    Location
                  </span>

                  <span className="text-sm text-neutral-300">
                    {settings.location}
                  </span>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-6 border-b border-neutral-800 py-4 hover:border-neutral-700 transition-colors duration-300">
                  <span className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                    Status
                  </span>

                  <span className="text-sm leading-6 text-neutral-300">
                    {settings.availability}
                  </span>
                </div>

              </div>

              {/* Contact */}
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sm text-neutral-400 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    Email ↗
                  </a>
                )}

                {settings.githubUrl && (
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-400 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    GitHub ↗
                  </a>
                )}

                {settings.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-400 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    LinkedIn ↗
                  </a>
                )}

                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-400 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    Instagram ↗
                  </a>
                )}
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}