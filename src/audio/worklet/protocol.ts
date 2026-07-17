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
  | { type: "pause" }
  | { type: "setTrackGain"; id: string; gain: number }
  | { type: "seek"; index: number };

// La position affichée par l'UI vient exclusivement de ce message : le
// thread principal ne calcule jamais la position lui-même.
export type WorkletToMainMessage = { type: "position"; index: number };
