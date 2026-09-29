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

export interface CreativeLabItem {
  id?: string;

  title: string;
  category: string;
  description: string;

  imageUrl?: string;
  projectUrl?: string;

  displayOrder: number;
  published: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}

const creativeLabCollection = collection(
  db,
  "creativeLab"
);

/**
 * Get all Creative Lab items for the admin dashboard.
 */
export async function getCreativeLabItems(): Promise<
  CreativeLabItem[]
> {
  const q = query(
    creativeLabCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as CreativeLabItem[];
}

/**
 * Get only published Creative Lab items.
 *
 * Sorting is performed in JavaScript so Firestore
 * does not require a composite index.
 */
export async function getPublishedCreativeLabItems(): Promise<
  CreativeLabItem[]
> {
  const q = query(
    creativeLabCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as CreativeLabItem[];

  return items.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Create a Creative Lab item.
 */
export async function createCreativeLabItem(
  item: Omit<
    CreativeLabItem,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(
    creativeLabCollection,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 * Update a Creative Lab item.
 */
export async function updateCreativeLabItem(
  id: string,
  data: Partial<
    Omit<
      CreativeLabItem,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const itemRef = doc(
    db,
    "creativeLab",
    id
  );

  await updateDoc(itemRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a Creative Lab item.
 */
export async function deleteCreativeLabItem(
  id: string
) {
  const itemRef = doc(
    db,
    "creativeLab",
    id
  );

  await deleteDoc(itemRef);
}