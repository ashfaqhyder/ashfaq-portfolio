import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firestore";

export interface AboutSettings {
  eyebrow: string;

  title: string;
  titleAccent: string;

  shortBio: string;
  biography: string;

  location: string;
  availability: string;

  profileImageUrl: string;

  email: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;

  updatedAt?: unknown;
}

export const defaultAboutSettings: AboutSettings = {
  eyebrow: "ABOUT",

  title: "Building at the intersection of",
  titleAccent: "technology and creativity.",

  shortBio:
    "Creative Developer & AI/ML Enthusiast focused on building digital experiences where technology becomes visual, interactive and intelligent.",

  biography:
    "I explore the space between software development, artificial intelligence, design and multimedia. My work ranges from web applications and AI systems to interactive experiences and visual experimentation.",

  location: "India",

  availability:
    "Open to creative technology, development and AI/ML opportunities.",

  profileImageUrl: "",

  email: "",
  githubUrl: "",
  linkedinUrl: "",
  instagramUrl: "",

  updatedAt: undefined,
};

const aboutRef = doc(
  db,
  "site",
  "about"
);

export async function getAboutSettings(): Promise<AboutSettings> {
  const snapshot = await getDoc(aboutRef);

  if (!snapshot.exists()) {
    return defaultAboutSettings;
  }

  return {
    ...defaultAboutSettings,
    ...snapshot.data(),
  } as AboutSettings;
}

export async function saveAboutSettings(
  settings: Omit<
    AboutSettings,
    "updatedAt"
  >
) {
  await setDoc(
    aboutRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}