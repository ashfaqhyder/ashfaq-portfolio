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
} from "firebase/firestore";

import { db } from "@/lib/firebase/firestore";

export type MediaType =
  | "image"
  | "video"
  | "pdf"
  | "other";

export type MediaFolder =
  | "projects"
  | "photography"
  | "portraits"
  | "creative"
  | "videos"
  | "general";

export interface MediaItem {
  id?: string;

  name: string;

  /*
   * Path or URL to the permanent asset.
   *
   * Examples:
   * /images/photography/image1.jpg
   * /images/projects/valorynn.jpg
   * /videos/hero.mp4
   */
  url: string;

  type: MediaType;

  folder: MediaFolder;

  altText?: string;

  description?: string;

  createdAt?: unknown;

  updatedAt?: unknown;
}

const mediaCollection = collection(
  db,
  "media"
);

/**
 * Get every registered media item.
 *
 * The actual files remain in public/.
 * Firestore only stores their metadata/path.
 */
export async function getMedia(): Promise<
  MediaItem[]
> {
  const q = query(
    mediaCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as MediaItem[];
}

/**
 * Register an existing permanent asset.
 *
 * This does NOT upload anything.
 */
export async function createMedia(
  media: Omit<
    MediaItem,
    "id" | "createdAt" | "updatedAt"
  >
) {
  const docRef = await addDoc(
    mediaCollection,
    {
      ...media,
      createdAt:
        serverTimestamp(),
      updatedAt:
        serverTimestamp(),
    }
  );

  return docRef.id;
}

/**
 * Update media metadata.
 */
export async function updateMedia(
  id: string,
  data: Partial<
    Omit<
      MediaItem,
      "id" | "createdAt" | "updatedAt"
    >
  >
) {
  const mediaRef = doc(
    db,
    "media",
    id
  );

  await updateDoc(
    mediaRef,
    {
      ...data,
      updatedAt:
        serverTimestamp(),
    }
  );
}

/**
 * Remove the media registration from Firestore.
 *
 * IMPORTANT:
 * This does NOT delete the actual file from public/.
 */
export async function removeMedia(
  id: string
) {
  const mediaRef = doc(
    db,
    "media",
    id
  );

  await deleteDoc(mediaRef);
}