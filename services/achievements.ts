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

export type AchievementStructure = "standalone" | "master" | "course";

export interface Achievement {
  id?: string;
  title: string;
  organization: string;
  organizationLogoUrl?: string;
  date: string;
  type: string;
  description: string;
  verificationUrl?: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  structure?: AchievementStructure;
  parentId?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const achievementsCollection = collection(db, "achievements");

function normalizeAchievement(
  id: string,
  data: Record<string, unknown>
): Achievement {
  return {
    id,
    title: String(data.title ?? ""),
    organization: String(data.organization ?? ""),
    organizationLogoUrl: data.organizationLogoUrl
      ? String(data.organizationLogoUrl)
      : "",
    date: String(data.date ?? ""),
    type: String(data.type ?? "Certification"),
    description: String(data.description ?? ""),
    verificationUrl: data.verificationUrl
      ? String(data.verificationUrl)
      : "",
    featured: data.featured === true,
    published: data.published === true,
    displayOrder: Number(data.displayOrder ?? 0),
    structure:
      data.structure === "master" || data.structure === "course"
        ? data.structure
        : "standalone",
    parentId:
      typeof data.parentId === "string" && data.parentId
        ? data.parentId
        : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getAchievements(): Promise<Achievement[]> {
  const snapshot = await getDocs(
    query(achievementsCollection, orderBy("displayOrder", "asc"))
  );

  return snapshot.docs.map((item) =>
    normalizeAchievement(
      item.id,
      item.data() as Record<string, unknown>
    )
  );
}

export async function getPublishedAchievements(): Promise<Achievement[]> {
  const snapshot = await getDocs(
    query(achievementsCollection, where("published", "==", true))
  );

  return snapshot.docs
    .map((item) =>
      normalizeAchievement(
        item.id,
        item.data() as Record<string, unknown>
      )
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getAchievementChildren(
  parentId: string
): Promise<Achievement[]> {
  const snapshot = await getDocs(
    query(
      achievementsCollection,
      where("published", "==", true),
      where("parentId", "==", parentId)
    )
  );

  return snapshot.docs
    .map((item) =>
      normalizeAchievement(
        item.id,
        item.data() as Record<string, unknown>
      )
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getAchievementChildrenFromList(
  achievements: Achievement[],
  parentId: string
): Achievement[] {
  return achievements
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createAchievement(
  achievement: Omit<Achievement, "id" | "createdAt" | "updatedAt">
) {
  const structure = achievement.structure ?? "standalone";

  const parentId =
    structure === "course"
      ? achievement.parentId ?? null
      : null;

  const ref = await addDoc(achievementsCollection, {
    ...achievement,
    structure,
    parentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateAchievement(
  id: string,
  data: Partial<
    Omit<Achievement, "id" | "createdAt" | "updatedAt">
  >
) {
  const payload = {
    ...data,
    ...(data.structure
      ? {
          structure: data.structure,
          parentId:
            data.structure === "course"
              ? data.parentId ?? null
              : null,
        }
      : {}),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, "achievements", id), payload);
}

export async function deleteAchievement(id: string) {
  await deleteDoc(doc(db, "achievements", id));
}