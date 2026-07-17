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
  | { type: "seek"; index: number }
  // Un seul bouton, 3 états : rien défini → A ; A défini → B ; A+B → supprimé.
  | { type: "toggleLoopPoint" };

// La position et l'état de boucle affichés par l'UI viennent exclusivement de
// ces messages : le thread principal ne les calcule/déduit jamais lui-même.
export type WorkletToMainMessage =
  | { type: "position"; index: number }
  | { type: "loop"; start: number | null; end: number | null };
