// Upload et suppression des fichiers audio d'un morceau dans Firebase
// Storage (songs/{songId}/{trackId}.flac — cf. CLAUDE.md « Modèle de
// données »). Ne touche jamais Firestore : composé avec songs.ts par
// src/firebase/songImport.ts.

import {
  deleteObject,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "./config";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
}

export function trackStoragePath(songId: string, trackId: string): string {
  return `songs/${songId}/${trackId}.flac`;
}

// Upload d'une piste ; onProgress est appelé à chaque tranche transférée.
// Résout avec le storagePath une fois l'upload terminé.
export function uploadTrackFile(
  songId: string,
  trackId: string,
  file: Blob,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const storagePath = trackStoragePath(songId, trackId);
  const uploadTask = uploadBytesResumable(ref(storage, storagePath), file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      reject,
      () => resolve(storagePath),
    );
  });
}

// Supprime tous les fichiers déjà uploadés pour un morceau (utilisé par
// l'abandon d'import, cf. src/firebase/songImport.ts).
export async function deleteAllSongFiles(songId: string): Promise<void> {
  const listing = await listAll(ref(storage, `songs/${songId}`));
  await Promise.all(listing.items.map((item) => deleteObject(item)));
}
