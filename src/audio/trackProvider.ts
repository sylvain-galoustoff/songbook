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
