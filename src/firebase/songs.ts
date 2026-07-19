// Accès Firestore aux morceaux (collection `songs`, cf. CLAUDE.md « Modèle
// de données »). Les pistes sont un tableau embarqué dans le document,
// jamais une sous-collection.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type UpdateData,
} from "firebase/firestore";
import { firestore } from "./config";

const SONGS_COLLECTION = "songs";

export type SongStatus = "draft" | "ready";

export interface TrackMeta {
  id: string;
  instrument: string;
  storagePath: string;
  order: number;
  defaultGain?: number;
  sampleRate: number;
  durationSamples: number;
  channels: number;
  sizeBytes: number;
  contentHash: string;
}

export interface SongRecord {
  id: string;
  title: string;
  order: number;
  createdAt: Date;
  createdBy: string;
  tempo?: number;
  key?: string;
  status: SongStatus;
  tracks: TrackMeta[];
  // Fréquence et durée canoniques du morceau, posées par
  // src/firebase/songImport.ts à la finalisation de l'import. Absentes tant
  // que le morceau est "draft" (voir NOTE d'incohérence en fin de tâche :
  // ces deux champs ne figurent pas dans le modèle de données de CLAUDE.md).
  sampleRate?: number;
  durationSamples?: number;
}

export interface NewSongInput {
  title: string;
  order: number;
  createdBy: string;
  tempo?: number;
  key?: string;
}

export interface SongUpdate {
  title?: string;
  order?: number;
  tempo?: number;
  key?: string;
  status?: SongStatus;
  tracks?: TrackMeta[];
  sampleRate?: number;
  durationSamples?: number;
}

// Forme brute d'un document Firestore : identique à SongRecord sauf
// `createdAt` en Timestamp (converti en Date côté app) et sans `id` (porté
// par le document lui-même, pas par ses champs).
interface SongFirestoreData {
  title: string;
  order: number;
  createdAt: Timestamp;
  createdBy: string;
  tempo?: number;
  key?: string;
  status: SongStatus;
  tracks: TrackMeta[];
  sampleRate?: number;
  durationSamples?: number;
}

function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

function songFromSnapshot(snapshot: DocumentSnapshot<DocumentData>): SongRecord {
  const data = snapshot.data()! as SongFirestoreData;
  return {
    id: snapshot.id,
    title: data.title,
    order: data.order,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
    tempo: data.tempo,
    key: data.key,
    status: data.status,
    tracks: data.tracks,
    sampleRate: data.sampleRate,
    durationSamples: data.durationSamples,
  };
}

export async function listReadySongs(): Promise<SongRecord[]> {
  const readySongsQuery = query(
    collection(firestore, SONGS_COLLECTION),
    where("status", "==", "ready"),
    orderBy("order"),
  );
  const snapshot = await getDocs(readySongsQuery);
  return snapshot.docs.map(songFromSnapshot);
}

export async function getSong(songId: string): Promise<SongRecord | null> {
  const snapshot = await getDoc(doc(firestore, SONGS_COLLECTION, songId));
  if (!snapshot.exists()) return null;
  return songFromSnapshot(snapshot);
}

export async function createDraftSong(input: NewSongInput): Promise<string> {
  const data: SongFirestoreData = {
    title: input.title,
    order: input.order,
    createdAt: dateToTimestamp(new Date()),
    createdBy: input.createdBy,
    status: "draft",
    tracks: [],
  };
  if (input.tempo !== undefined) data.tempo = input.tempo;
  if (input.key !== undefined) data.key = input.key;

  const songRef = await addDoc(collection(firestore, SONGS_COLLECTION), data);
  return songRef.id;
}

export async function updateSong(
  songId: string,
  patch: SongUpdate,
): Promise<void> {
  // Cast nécessaire : sans `.withConverter()`, `updateDoc` attend un
  // `UpdateData<DocumentData>` dont le typage (chemins en pointillés inclus)
  // ne peut pas s'inférer d'une interface applicative comme SongUpdate.
  await updateDoc(
    doc(firestore, SONGS_COLLECTION, songId),
    patch as UpdateData<DocumentData>,
  );
}

export async function deleteSong(songId: string): Promise<void> {
  await deleteDoc(doc(firestore, SONGS_COLLECTION, songId));
}
