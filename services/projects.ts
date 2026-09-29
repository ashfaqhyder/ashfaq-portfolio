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

export interface Project {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured: boolean;
  published: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const projectsCollection = collection(db, "projects");

/**
 * Get all projects.
 * Used by the admin CMS.
 */
export async function getProjects(): Promise<Project[]> {
  const q = query(
    projectsCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Project[];
}

/**
 * Get only published projects.
 * Used by the public portfolio.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const q = query(
    projectsCollection,
    where("published", "==", true),
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Project[];
}

/**
 * Create a new project.
 */
export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
) {
  const docRef = await addDoc(projectsCollection, {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update an existing project.
 */
export async function updateProject(
  id: string,
  data: Partial<
    Omit<Project, "id" | "createdAt" | "updatedAt">
  >
) {
  const projectRef = doc(db, "projects", id);

  await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a project.
 */
export async function deleteProject(id: string) {
  const projectRef = doc(db, "projects", id);

  await deleteDoc(projectRef);
}