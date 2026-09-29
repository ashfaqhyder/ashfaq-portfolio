import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "./storage-client";

export async function uploadMedia(
  file: File,
  folder: string = "portfolio"
) {
  const extension = file.name.split(".").pop() || "file";

  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  const fileName = `${Date.now()}-${safeName}.${extension}`;

  const storageRef = ref(
    storage,
    `${folder}/${fileName}`
  );

  await uploadBytes(storageRef, file);

  const downloadUrl = await getDownloadURL(storageRef);

  return {
    name: file.name,
    path: storageRef.fullPath,
    url: downloadUrl,
    type: file.type,
    size: file.size,
  };
}

export async function deleteMedia(path: string) {
  const storageRef = ref(storage, path);

  await deleteObject(storageRef);
}