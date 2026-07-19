// Orchestration de l'import d'un morceau (wizard, pas encore construit).
// Compose uniquement songs.ts et trackUpload.ts : aucun appel direct à
// Firestore ou Storage ici.
//
// Séquence imposée (cf. CLAUDE.md « Format & stockage audio ») :
//   1. startSongImport    — crée le document en status "draft", tracks: [].
//   2. uploadImportTrack  — un appel par piste, séquentiellement côté
//      appelant (await entre chaque appel) ; n'écrit rien dans Firestore.
//   3. finalizeSongImport — unique écriture finale : tracks complet,
//      fréquence/durée canoniques, status "ready".
// Aucune écriture Firestore intermédiaire entre 2 et 3 : le morceau est soit
// draft avec zéro piste, soit ready avec toutes ses pistes. Un morceau
// incomplet produirait un mix faux (cf. .claude/rules/audio-engine.md,
// « Chargement & erreurs »).
//
// L'avancement (quelles pistes ont déjà été uploadées) n'est pas persisté :
// il vit en mémoire chez l'appelant (le futur composant wizard), qui
// accumule les TrackMeta renvoyés par uploadImportTrack jusqu'à
// finalizeSongImport. Un abandon non traité par l'utilisateur laisse un
// draft invisible dans la liste (listReadySongs ne renvoie que les morceaux
// "ready"), ce qui est acceptable.

import {
  createDraftSong,
  deleteSong,
  updateSong,
  type NewSongInput,
  type TrackMeta,
} from "./songs";
import {
  deleteAllSongFiles,
  uploadTrackFile,
  type UploadProgress,
} from "./trackUpload";

export interface TrackImportProgress extends UploadProgress {
  trackId: string;
}

export interface TrackUploadInput {
  id: string;
  instrument: string;
  order: number;
  file: Blob;
  defaultGain?: number;
  sampleRate: number;
  durationSamples: number;
  channels: number;
  sizeBytes: number;
  contentHash: string;
}

// Étape 1 : crée le document draft. L'id retourné est nécessaire pour
// construire les chemins Storage des pistes à venir.
export async function startSongImport(input: NewSongInput): Promise<string> {
  return createDraftSong(input);
}

// Étape 2 : upload d'une piste déjà validée (cf. src/audio/trackValidation.ts).
// Ne touche pas Firestore. onProgress est appelé à chaque tranche transférée.
export async function uploadImportTrack(
  songId: string,
  track: TrackUploadInput,
  onProgress?: (progress: TrackImportProgress) => void,
): Promise<TrackMeta> {
  const storagePath = await uploadTrackFile(
    songId,
    track.id,
    track.file,
    (progress) => onProgress?.({ trackId: track.id, ...progress }),
  );

  const trackMeta: TrackMeta = {
    id: track.id,
    instrument: track.instrument,
    storagePath,
    order: track.order,
    sampleRate: track.sampleRate,
    durationSamples: track.durationSamples,
    channels: track.channels,
    sizeBytes: track.sizeBytes,
    contentHash: track.contentHash,
  };
  if (track.defaultGain !== undefined) trackMeta.defaultGain = track.defaultGain;
  return trackMeta;
}

// Étape 3 : unique écriture Firestore finale. La fréquence canonique est
// celle de la première piste importée (référence de validation, cf.
// src/audio/trackValidation.ts) ; la durée canonique est la plus longue des
// pistes, cohérente avec AudioEngine.getDurationSamples (voir
// src/audio/audioEngine.ts) qui définit la durée du morceau de la même
// façon au chargement.
export async function finalizeSongImport(
  songId: string,
  tracks: TrackMeta[],
): Promise<void> {
  const [reference] = tracks;
  const durationSamples = Math.max(
    ...tracks.map((track) => track.durationSamples),
  );

  await updateSong(songId, {
    status: "ready",
    tracks,
    sampleRate: reference?.sampleRate,
    durationSamples,
  });
}

// Abandon : supprime les fichiers déjà uploadés puis le document draft.
export async function abortSongImport(songId: string): Promise<void> {
  await deleteAllSongFiles(songId);
  await deleteSong(songId);
}
