import { getBytes, ref } from "firebase/storage";
import { storage } from "../firebase/config";
import { trackStoragePath } from "../firebase/trackUpload";

// Fournisseur d'octets pour les pistes : sépare la récupération des données
// audio brutes (fetch) du moteur, qui ne fait que décoder et mixer.
// Voir .claude/rules/audio-engine.md.

export interface TrackRequest {
  id: string;
  instrument: string;
}

export interface TrackByteProvider {
  fetchTrackBytes(track: TrackRequest): Promise<ArrayBuffer>;
}

// Implémentation statique : les fichiers FLAC sont servis depuis public/,
// nommés d'après l'id de la piste (ex. public/Batterie.flac).
export class StaticTrackProvider implements TrackByteProvider {
  async fetchTrackBytes(track: TrackRequest): Promise<ArrayBuffer> {
    const response = await fetch(`/${track.id}.flac`);
    return response.arrayBuffer();
  }
}

// Implémentation Firebase Storage : lit songs/{songId}/{trackId}.flac en une
// fois (pas de streaming, cf. CLAUDE.md « À NE JAMAIS FAIRE »).
export class FirebaseTrackProvider implements TrackByteProvider {
  private readonly songId: string;

  constructor(songId: string) {
    this.songId = songId;
  }

  async fetchTrackBytes(track: TrackRequest): Promise<ArrayBuffer> {
    const storageRef = ref(storage, trackStoragePath(this.songId, track.id));
    return getBytes(storageRef);
  }
}
