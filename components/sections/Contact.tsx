"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Mail,
} from "lucide-react";

import {
  defaultSiteSettings,
  getSiteSettings,
  SiteSettings,
} from "@/services/settings";

export default function Contact() {
  const [settings, setSettings] =
    useState<SiteSettings>(
      defaultSiteSettings
    );

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error(
          "Failed to load contact settings:",
          error
        );
      }
    }

    loadSettings();
  }, []);

  return (
    <section
      id="contact"
      className="border-t border-neutral-900 px-6 py-24 md:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-neutral-600">
          11 / Contact
        </p>

        <h2 className="max-w-6xl text-5xl font-medium leading-[0.92] tracking-tight md:text-7xl lg:text-8xl xl:text-9xl">
          Have an idea?
          <br />
          <span className="text-neutral-500">
            Let&apos;s build it.
          </span>
        </h2>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-xl text-sm leading-7 text-neutral-600 md:text-base">
            Whether it&apos;s a digital product, an AI
            experiment, a creative project or something
            completely different, I&apos;m always interested
            in building meaningful things.
          </p>

          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="group inline-flex w-fit items-center gap-4 border-b border-neutral-800 pb-3 text-sm text-neutral-300 transition-colors duration-300 hover:border-[var(--portfolio-accent)] hover:text-white"
            >
              <Mail
                size={17}
                className="text-neutral-600 transition-colors duration-300 group-hover:text-[var(--portfolio-accent)]"
              />

              <span>
                {settings.contactEmail}
              </span>

              <ArrowUpRight
                size={16}
                className="text-neutral-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--portfolio-accent)]"
              />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}