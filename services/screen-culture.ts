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

export type ScreenCultureCategory = "movies-series" | "anime";

export interface ScreenCulturePoster {
  id?: string;
  category: ScreenCultureCategory;
  title: string;
  description?: string;
  imageUrl: string;
  imdbUrl: string;
  published: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const postersCollection = collection(db, "screenCulturePosters");

function sortByDisplayOrder(posters: ScreenCulturePoster[]) {
  return posters.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/** Admin CMS: retrieve all posters, including unpublished ones. */
export async function getScreenCulturePosters(): Promise<ScreenCulturePoster[]> {
  const snapshot = await getDocs(
    query(postersCollection, orderBy("displayOrder", "asc")),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as ScreenCulturePoster[];
}

/** Public gallery: filter published posters in Firestore, then sort locally.
 * This avoids the composite index for published + displayOrder.
 */
export async function getPublishedScreenCulturePosters(): Promise<ScreenCulturePoster[]> {
  const snapshot = await getDocs(
    query(postersCollection, where("published", "==", true)),
  );
  const posters = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ScreenCulturePoster[];
  return sortByDisplayOrder(posters);
}

export async function createScreenCulturePoster(
  poster: Omit<ScreenCulturePoster, "id" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(postersCollection, {
    ...poster,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateScreenCulturePoster(
  id: string,
  data: Partial<Omit<ScreenCulturePoster, "id" | "createdAt" | "updatedAt">>
) {
  await updateDoc(doc(db, "screenCulturePosters", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteScreenCulturePoster(id: string) {
  await deleteDoc(doc(db, "screenCulturePosters", id));
}
