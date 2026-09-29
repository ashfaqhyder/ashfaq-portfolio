"use client";

import { useState } from "react";

import Hero from "@/components/sections/Hero";
import Introduction from "@/components/sections/Introduction";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Achievements from "@/components/sections/Achievements";
import Skills from "@/components/sections/Skills";
import DigitalLab from "@/components/sections/DigitalLab";
import CreativeLab from "@/components/sections/CreativeLab";
import Photography from "@/components/sections/Photography";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import PublicLogo from "@/components/sections/PublicLogo";

import LandingIntro from "@/components/sections/LandingIntro";
import PublicNavigation from "@/components/sections/PublicNavigation";
import PortfolioCursor from "@/components/PortfolioCursor";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <main
      id="top"
      className="min-h-screen overflow-x-clip bg-[#050505] text-white"
    >
      {!introComplete && (
        <LandingIntro
          onNavigationReveal={() => {}}
          onComplete={() => {
            setIntroComplete(true);
          }}
        />
      )}

      <div
        className={
          introComplete
            ? "opacity-100 transition-opacity duration-700"
            : "pointer-events-none opacity-0"
        }
      > <PublicLogo />
        <PublicNavigation />

        <PortfolioCursor />

        <Hero />
        <Introduction />
        <About />
        <Experience />
        <Projects />
        <Achievements />
        <Skills />
        <DigitalLab />
        <CreativeLab />
        <Photography />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}