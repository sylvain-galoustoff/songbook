// Protocole de messages entre le thread principal et l'AudioWorkletProcessor.
// Voir .claude/rules/audio-engine.md.

export interface TrackPayload {
  id: string;
  channels: ArrayBuffer[];
  length: number;
}

export type MainToWorkletMessage =
  | { type: "loadTracks"; tracks: TrackPayload[] }
  | { type: "play" }
  | { type: "pause" };
