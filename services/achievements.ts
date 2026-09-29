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

export interface Achievement {
  id?: string;

  title: string;

  organization: string;

  /**
   * Public URL of the organization's logo.
   *
   * Example:
   * https://example.com/logo.svg
   */
  organizationLogoUrl?: string;

  /**
   * Example:
   * "June 2026"
   * "April 10–11, 2025"
   */
  date: string;

  /**
   * Examples:
   * Certification
   * Hackathon
   * Research
   * Award
   * Participation
   */
  type: string;

  description: string;

  /**
   * Official issuer verification page.
   */
  verificationUrl?: string;

  /**
   * Controls whether this achievement is highlighted.
   */
  featured: boolean;

  /**
   * Controls whether this achievement appears publicly.
   */
  published: boolean;

  /**
   * Controls the order in the public portfolio.
   */
  displayOrder: number;

  createdAt?: unknown;

  updatedAt?: unknown;
}

const achievementsCollection = collection(
  db,
  "achievements"
);

/**
 * Get all achievements for the admin CMS.
 */
export async function getAchievements(): Promise<
  Achievement[]
> {
  const q = query(
    achievementsCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Achievement[];
}

/**
 * Get only published achievements for the public portfolio.
 *
 * Sorting is done in JavaScript so Firestore does not
 * require a composite index for published + displayOrder.
 */
export async function getPublishedAchievements(): Promise<
  Achievement[]
> {
  const q = query(
    achievementsCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const achievements = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Achievement[];

  return achievements.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Create a new achievement.
 */
export async function createAchievement(
  achievement: Omit<
    Achievement,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(
    achievementsCollection,
    {
      ...achievement,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 * Update an existing achievement.
 */
export async function updateAchievement(
  id: string,
  data: Partial<
    Omit<
      Achievement,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const achievementRef = doc(
    db,
    "achievements",
    id
  );

  await updateDoc(achievementRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an achievement.
 */
export async function deleteAchievement(
  id: string
) {
  const achievementRef = doc(
    db,
    "achievements",
    id
  );

  await deleteDoc(achievementRef);
}