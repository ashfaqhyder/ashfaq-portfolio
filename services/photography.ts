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

export interface Photography {
  id?: string;

  /**
   * Public path to the permanent image.
   * Required.
   */
  photo: string;

  /**
   * Photo title.
   * Required.
   */
  title: string;

  /**
   * Location where the photograph was taken.
   * Required.
   */
  location: string;

  /**
   * Optional date.
   */
  date?: string;

  /**
   * Optional description.
   */
  description?: string;

  /**
   * Optional ordering value.
   */
  displayOrder?: number;

  /**
   * Optional publication state.
   *
   * Defaults to true when creating a photograph.
   */
  published?: boolean;

  createdAt?: unknown;
  updatedAt?: unknown;
}

const photographyCollection = collection(
  db,
  "photography"
);

/**
 * Get all photography entries for the admin CMS.
 */
export async function getPhotography(): Promise<
  Photography[]
> {
  const q = query(
    photographyCollection,
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  const photography = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  ) as Photography[];

  return photography;
}

/**
 * Get only published photography for the
 * public portfolio.
 *
 * Sorting is performed in JavaScript so that
 * a Firestore composite index is not required.
 */
export async function getPublishedPhotography(): Promise<
  Photography[]
> {
  const q = query(
    photographyCollection,
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  const photography = snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  ) as Photography[];

  return photography.sort(
    (a, b) =>
      (a.displayOrder ?? 0) -
      (b.displayOrder ?? 0)
  );
}

/**
 * Create a new photography entry.
 *
 * Photo, title and location are required.
 * Optional fields are only stored when provided.
 */
export async function createPhotography(
  photography: Omit<
    Photography,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(
    photographyCollection,
    {
      ...photography,
      displayOrder:
        photography.displayOrder ?? 0,
      published:
        photography.published ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 * Update an existing photography entry.
 */
export async function updatePhotography(
  id: string,
  data: Partial<
    Omit<
      Photography,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const photographyRef = doc(
    db,
    "photography",
    id
  );

  await updateDoc(photographyRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a photography entry.
 */
export async function deletePhotography(
  id: string
) {
  const photographyRef = doc(
    db,
    "photography",
    id
  );

  await deleteDoc(photographyRef);
}