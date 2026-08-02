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
import type { TrackModeChoice } from "../types/track";

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

// "" est une ligne légitime (séparateur couplet/refrain). `timeMs` absent =
// autoscroll libre (Phase 1) ; présent = défilement synchronisé (Phase 2).
export interface LyricLine {
  text: string;
  timeMs?: number;
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
  // Mode de piste choisi au wizard (cf. src/views/NewSong/TrackMode) : le
  // futur lecteur en a besoin pour savoir s'il affiche l'UI multipiste
  // (mute par instrument) ou un lecteur simplifié à piste unique. Absent
  // pour un morceau sans piste audio (lyrics-only).
  trackMode?: TrackModeChoice;
  tracks: TrackMeta[];
  // Fréquence et durée canoniques du morceau, posées par
  // src/firebase/songImport.ts à la finalisation de l'import. Absentes tant
  // que le morceau est "draft" (voir NOTE d'incohérence en fin de tâche :
  // ces deux champs ne figurent pas dans le modèle de données de CLAUDE.md).
  sampleRate?: number;
  durationSamples?: number;
  lyrics?: { lines: LyricLine[] };
}

export interface NewSongInput {
  title: string;
  order: number;
  createdBy: string;
  trackMode: TrackModeChoice;
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
  lyrics?: { lines: LyricLine[] };
}

export interface NewLyricsSongInput {
  title: string;
  order: number;
  createdBy: string;
  lyrics: { lines: LyricLine[] };
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
  trackMode?: TrackModeChoice;
  tracks: TrackMeta[];
  sampleRate?: number;
  durationSamples?: number;
  lyrics?: { lines: LyricLine[] };
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
    trackMode: data.trackMode,
    tracks: data.tracks,
    sampleRate: data.sampleRate,
    durationSamples: data.durationSamples,
    lyrics: data.lyrics,
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

// Position d'insertion pour un nouveau morceau : approximation simple par
// le nombre de morceaux existants (tous statuts confondus), suffisante tant
// qu'il n'y a pas de réordonnancement manuel dans l'app.
export async function getNextSongOrder(): Promise<number> {
  const snapshot = await getDocs(collection(firestore, SONGS_COLLECTION));
  return snapshot.size;
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
    trackMode: input.trackMode,
    tracks: [],
  };
  if (input.tempo !== undefined) data.tempo = input.tempo;
  if (input.key !== undefined) data.key = input.key;

  const songRef = await addDoc(collection(firestore, SONGS_COLLECTION), data);
  return songRef.id;
}

// Action « paroles » sur un morceau NEUF (docs/lyrics-feature.md §3,
// « orchestration d'écriture — asymétrie assumée ») : rien à uploader, donc
// une seule écriture qui crée le document directement en "ready", sans
// jamais passer par un draft (contrairement au flux audio de songImport.ts).
export async function createReadySongWithLyrics(input: NewLyricsSongInput): Promise<string> {
  const data: SongFirestoreData = {
    title: input.title,
    order: input.order,
    createdAt: dateToTimestamp(new Date()),
    createdBy: input.createdBy,
    status: "ready",
    tracks: [],
    lyrics: input.lyrics,
  };

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

// Conditionne l'onglet Musique et le chargement du moteur audio.
export function isPlayable(song: SongRecord): boolean {
  return song.tracks.length > 0;
}

// Un bloc collé devient des lignes par simple split sur "\n", SANS filtrer
// les lignes vides (une ligne vide est un séparateur couplet/refrain
// légitime, cf. docs/lyrics-feature.md §2) et sans trim (le texte est
// préservé tel quel ; le trim ne sert qu'à juger du contenu, cf.
// hasLyricsContent ci-dessous).
export function linesFromBlock(block: string): LyricLine[] {
  return block.split("\n").map((text) => ({ text }));
}

// Un ensemble de lignes "a du contenu" s'il en existe au moins une non vide
// une fois trimmée. Partagé par hasLyrics (morceau déjà enregistré) et par la
// validation de saisie (avant tout enregistrement) pour ne pas dupliquer ce
// jugement à deux endroits.
export function hasLyricsContent(lines: LyricLine[]): boolean {
  return lines.some((line) => line.text.trim().length > 0);
}

// Conditionne l'onglet Lyrics : présent ET au moins une ligne non vide.
export function hasLyrics(song: SongRecord): boolean {
  return song.lyrics !== undefined && hasLyricsContent(song.lyrics.lines);
}
