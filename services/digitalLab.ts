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

export interface DigitalLabItem {
  id?: string;

  title: string;
  category: string;
  description: string;

  imageUrl?: string;
  technologies: string[];

  projectUrl?: string;

  displayOrder: number;
  published: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}

const digitalLabCollection = collection(
  db,
  "digitalLab"
);

/**
 * Get all Digital Lab items for the admin dashboard.
 */
export async function getDigitalLabItems(): Promise<
  DigitalLabItem[]
> {
  const q = query(
    digitalLabCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as DigitalLabItem[];
}

/**
 * Get only published Digital Lab items.
 *
 * Sorting is performed in JavaScript so Firestore
 * does not require a composite index.
 */
export async function getPublishedDigitalLabItems(): Promise<
  DigitalLabItem[]
> {
  const q = query(
    digitalLabCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as DigitalLabItem[];

  return items.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Create a Digital Lab item.
 */
export async function createDigitalLabItem(
  item: Omit<
    DigitalLabItem,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(
    digitalLabCollection,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 * Update a Digital Lab item.
 */
export async function updateDigitalLabItem(
  id: string,
  data: Partial<
    Omit<
      DigitalLabItem,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const itemRef = doc(
    db,
    "digitalLab",
    id
  );

  await updateDoc(itemRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a Digital Lab item.
 */
export async function deleteDigitalLabItem(
  id: string
) {
  const itemRef = doc(
    db,
    "digitalLab",
    id
  );

  await deleteDoc(itemRef);
}