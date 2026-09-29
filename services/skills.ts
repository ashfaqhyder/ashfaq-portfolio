import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firestore";

export type SkillGroup =
  | "Programming"
  | "Web Development"
  | "AI / ML"
  | "Cloud / Backend"
  | "Creative / Multimedia"
  | "Tools"
  | "Soft Skills"
  | "Languages";

export type ProficiencyLevel =
  | "Beginner"
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export type LearningContext =
  | "Academic"
  | "Self-taught"
  | "Certification"
  | "Internship"
  | "Project"
  | "Workshop";

export interface Skill {
  id?: string;

  name: string;
  group: SkillGroup;

  /**
   * Optional self-assessed proficiency.
   */
  proficiency?: ProficiencyLevel;

  /**
   * Optional ways in which the skill was learned
   * or developed.
   */
  learningContext?: LearningContext[];

  /**
   * Optional number of years of experience.
   */
  yearsOfExperience?: number;

  displayOrder: number;
  published: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}

export const skillGroups: SkillGroup[] = [
  "Programming",
  "Web Development",
  "AI / ML",
  "Cloud / Backend",
  "Creative / Multimedia",
  "Tools",
  "Soft Skills",
  "Languages",
];

export const proficiencyLevels: ProficiencyLevel[] = [
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Expert",
];

export const learningContexts: LearningContext[] = [
  "Academic",
  "Self-taught",
  "Certification",
  "Internship",
  "Project",
  "Workshop",
];

const skillsCollection = collection(db, "skills");

/**
 * Get all skills for the admin dashboard.
 */
export async function getSkills(): Promise<Skill[]> {
  const q = query(
    skillsCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Skill[];
}

/**
 * Get only published skills for the public portfolio.
 *
 * Sorting is performed in JavaScript so Firestore
 * does not require a composite index.
 */
export async function getPublishedSkills(): Promise<Skill[]> {
  const q = query(
    skillsCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const skills = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Skill[];

  return skills.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Create a new skill.
 */
export async function createSkill(
  skill: Omit<
    Skill,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(skillsCollection, {
    ...skill,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update an existing skill.
 */
export async function updateSkill(
  id: string,
  data: Partial<
    Omit<
      Skill,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const skillRef = doc(db, "skills", id);

  await updateDoc(skillRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a skill.
 */
export async function deleteSkill(id: string) {
  const skillRef = doc(db, "skills", id);

  await deleteDoc(skillRef);
}