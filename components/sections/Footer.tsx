"use client";
import DitheredLogo from "@/components/DitheredLogo";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
} from "lucide-react";

import {
  SiGithub,
  SiInstagram,
  SiX,
} from "react-icons/si";

import {
  FaLinkedinIn,
} from "react-icons/fa";

import {
  defaultSiteSettings,
  getSiteSettings,
  SiteSettings,
} from "@/services/settings";

interface SocialLink {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
}

export default function Footer() {
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
          "Failed to load footer settings:",
          error
        );
      }
    }

    loadSettings();
  }, []);

  const socialLinks: SocialLink[] = [
    ...(settings.githubUrl
      ? [
          {
            label: "GitHub",
            href: settings.githubUrl,
            icon: SiGithub,
          },
        ]
      : []),

    ...(settings.linkedinUrl
      ? [
          {
            label: "LinkedIn",
            href: settings.linkedinUrl,
            icon: FaLinkedinIn,
          },
        ]
      : []),

    ...(settings.instagramUrl
      ? [
          {
            label: "Instagram",
            href: settings.instagramUrl,
            icon: SiInstagram,
          },
        ]
      : []),

    ...(settings.xUrl
      ? [
          {
            label: "X",
            href: settings.xUrl,
            icon: SiX,
          },
        ]
      : []),
  ];

  return (
    <footer className="border-t border-neutral-900 bg-transparent px-6 py-10 text-white md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Main footer */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Center logo */}
          <div className="flex shrink-0 justify-center">
            <DitheredLogo
              imageSrc="/hyder-icon-logo.png"
              particleColor="currentColor"
              className="h-16 w-16"
            />
          </div>

          {/* Identity */}
          <div className="min-w-0">
            <p className="text-lg font-medium tracking-tight">
              ASHFAQ HYDER
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-neutral-700">
              Creative Developer &amp; AI/ML Enthusiast
            </p>

            <p className="mt-3 text-xs leading-5 text-neutral-700">
              Building at the intersection of code, design and intelligence.
            </p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Footer navigation"
            className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 md:justify-end"
          >
            <FooterLink
              href="#about"
              label="About"
            />

            <FooterLink
              href="#projects"
              label="Projects"
            />

            <FooterLink
              href="#experience"
              label="Experience"
            />

            <FooterLink
              href="#skills"
              label="Skills"
            />

            <FooterLink
              href="#contact"
              label="Contact"
            />
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col gap-6 border-t border-neutral-900 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-800">
            © {new Date().getFullYear()} Ashfaq Hyder
          </p>

          <div className="flex flex-wrap items-center gap-5">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="text-neutral-700 transition-colors duration-300 hover:text-[var(--portfolio-accent)]"
                >
                  <Icon size={15} />
                </a>
              );
            })}

            <span className="mx-1 hidden h-3 w-px bg-neutral-900 sm:block" />

            <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-neutral-800">
              CODE × DESIGN × INTELLIGENCE

              <ArrowUpRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="text-[10px] uppercase tracking-[0.2em] text-neutral-700 transition-colors duration-300 hover:text-white"
    >
      {label}
    </a>
  );
}