/* Public portfolio page. Includes the Hero and all existing public sections. */

"use client";

import { useEffect, useState } from "react";

import Hero from "@/components/sections/Hero";
import IntroductionAbout from "@/components/sections/IntroductionAbout";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Achievements from "@/components/sections/Achievements";
import Skills from "@/components/sections/Skills";
import DigitalLab from "@/components/sections/DigitalLab";
import CreativeLab from "@/components/sections/CreativeLab";
import Photography from "@/components/sections/Photography";
import BeyondTheFrame from "@/components/sections/BeyondTheFrame";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import PublicLogo from "@/components/sections/PublicLogo";
import LandingIntro from "@/components/sections/LandingIntro";
import PublicNavigation from "@/components/sections/PublicNavigation";
import PortfolioCursor from "@/components/PortfolioCursor";

const INTRO_KEY = "portfolio-intro-v2-completed";
const RETURN_KEY = "returning-from-projects";

export default function Home() {
  // Keep the first render identical on the server and in the browser.
  // Read sessionStorage only after hydration to avoid a className mismatch.
  const [introComplete, setIntroComplete] = useState(false);
  const [introStateResolved, setIntroStateResolved] = useState(false);

  useEffect(() => {
    const returning = sessionStorage.getItem(RETURN_KEY);

    if (returning === "true") {
      sessionStorage.removeItem(RETURN_KEY);
      setIntroComplete(true);
    } else {
      setIntroComplete(sessionStorage.getItem(INTRO_KEY) === "true");
    }

    setIntroStateResolved(true);
  }, []);

  function handleIntroComplete() {
    sessionStorage.setItem(INTRO_KEY, "true");
    setIntroComplete(true);
  }

  return (
    <main
      id="top"
      className="relative z-10 min-h-screen overflow-x-clip"
      style={{
        // IMPORTANT: transparent here lets the fixed dither canvas show.
        // The actual CMS background is still supplied by body/html.
        background: "transparent",
        color: "var(--portfolio-text)",
      }}
    >
      {introStateResolved && !introComplete && (
        <LandingIntro
          onNavigationReveal={() => {}}
          onComplete={handleIntroComplete}
        />
      )}

      {introComplete && (
        <div
          className="relative z-10 opacity-100"
          style={{
            animation: "portfolioContentReveal 700ms ease both",
          }}
        >
          <PublicLogo />
          <PublicNavigation />
          <PortfolioCursor />

          <Hero />
          <IntroductionAbout />
          <Experience />
          <Projects />
          <Achievements />
          <Skills />
          <DigitalLab />
          <CreativeLab />
          <Photography />
          <BeyondTheFrame />
          <Contact />
          <Footer />
        </div>
      )}

      <style jsx>{`
        @keyframes portfolioContentReveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
