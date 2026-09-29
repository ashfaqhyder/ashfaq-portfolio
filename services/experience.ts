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

export interface Experience {
  id?: string;

  organization: string;
  role: string;

  organizationLogoUrl?: string;

  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;

  location?: string;
  type: string;

  description: string;
  responsibilities: string[];
  technologies: string[];

  featured: boolean;
  published: boolean;
  displayOrder: number;

  createdAt?: unknown;
  updatedAt?: unknown;
}

const experienceCollection = collection(db, "experience");

export async function getExperience(): Promise<Experience[]> {
  const q = query(
    experienceCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Experience[];
}

export async function getPublishedExperience(): Promise<Experience[]> {
  const q = query(
    experienceCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const experiences = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Experience[];

  /*
   * Currently working roles always appear first.
   * Other roles follow their display order.
   */
  return experiences.sort((a, b) => {
    if (a.currentlyWorking && !b.currentlyWorking) {
      return -1;
    }

    if (!a.currentlyWorking && b.currentlyWorking) {
      return 1;
    }

    return a.displayOrder - b.displayOrder;
  });
}

export async function createExperience(
  experience: Omit<
    Experience,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(experienceCollection, {
    ...experience,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateExperience(
  id: string,
  data: Partial<
    Omit<Experience, "id" | "createdAt" | "updatedAt">
  >
) {
  const experienceRef = doc(
    db,
    "experience",
    id
  );

  await updateDoc(experienceRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExperience(id: string) {
  const experienceRef = doc(
    db,
    "experience",
    id
  );

  await deleteDoc(experienceRef);
}