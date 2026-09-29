import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firestore";

export interface Capability {
  number: string;
  title: string;
  description: string;
}

export interface HomepageSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroCta: string;

  introLabel: string;
  introTitle: string;
  introAccent: string;
  introDescription: string;

  capabilitiesLabel: string;
  capabilitiesTitle: string;
  capabilities: Capability[];

  contactLabel: string;
  contactTitle: string;
  contactAccent: string;
  contactCta: string;
  contactEmail: string;

  updatedAt?: unknown;
}

export const defaultHomepageSettings: HomepageSettings = {
  heroEyebrow:
    "CODE × DESIGN × INTELLIGENCE",

  heroTitle: "Creative",

  heroTitleAccent:
    "Developer",

  heroDescription:
    "I build digital experiences where technology becomes visual, interactive and intelligent.",

  heroCta:
    "Explore Work",

  introLabel:
    "01 / Introduction",

  introTitle:
    "I create digital products that sit between",

  introAccent:
    "technology and visual expression.",

  introDescription:
    "From web applications and AI systems to interactive experiences and visual design, my work explores how technology can become something useful, expressive and memorable.",

  capabilitiesLabel:
    "06 / Capabilities",

  capabilitiesTitle:
    "What I build.",

  capabilities: [
    {
      number: "01",
      title: "Web Development",
      description:
        "Modern, responsive and performance-focused digital products.",
    },
    {
      number: "02",
      title: "AI / ML",
      description:
        "Machine learning systems and intelligent applications.",
    },
    {
      number: "03",
      title: "Creative Development",
      description:
        "Interactive experiences combining technology, motion and design.",
    },
    {
      number: "04",
      title: "Visual Design",
      description:
        "Posters, interfaces, branding and visual communication.",
    },
  ],

  contactLabel:
    "07 / Contact",

  contactTitle:
    "Let's build",

  contactAccent:
    "something.",

  contactCta:
    "Get in touch ↗",

  contactEmail:
    "your-email@example.com",

  updatedAt:
    undefined,
};

const homepageRef = doc(
  db,
  "site",
  "homepage"
);

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const snapshot =
    await getDoc(homepageRef);

  if (!snapshot.exists()) {
    return defaultHomepageSettings;
  }

  const data = snapshot.data();

  return {
    ...defaultHomepageSettings,
    ...data,

    /*
     * Keep compatibility with an older
     * homepage document that may not yet
     * contain capabilities.
     */
    capabilities:
      Array.isArray(data.capabilities)
        ? data.capabilities
        : defaultHomepageSettings.capabilities,
  } as HomepageSettings;
}

export async function saveHomepageSettings(
  settings: Omit<
    HomepageSettings,
    "updatedAt"
  >
) {
  await setDoc(
    homepageRef,
    {
      ...settings,
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}