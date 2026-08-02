export type ChordQuality =
  | "maj"
  | "min"
  | "7"
  | "m7"
  | "maj7"
  | "sus2"
  | "sus4"
  | "dim"
  | "aug"
  | "add9"
  | "6"
  | "m6"
  | "9";

// `root` est une pitch class 0..11 (0 = DO, demi-tons ascendants).
export interface Chord {
  root: number;
  quality: ChordQuality;
}

export interface ChordSection {
  name: string;
  chords: Chord[];
}

// Libellés solfège par pitch class, DIÈSES par défaut (pas de bémols).
const ROOT_LABELS: Record<number, string> = {
  0: "DO",
  1: "DO♯",
  2: "RE",
  3: "RE♯",
  4: "MI",
  5: "FA",
  6: "FA♯",
  7: "SOL",
  8: "SOL♯",
  9: "LA",
  10: "LA♯",
  11: "SI",
};

export function rootLabel(root: number): string {
  return ROOT_LABELS[root];
}

const QUALITY_LABELS: Record<ChordQuality, string> = {
  maj: "majeur",
  min: "mineur",
  "7": "7",
  m7: "m7",
  maj7: "Maj7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  aug: "aug",
  add9: "add9",
  "6": "6",
  m6: "m6",
  "9": "9",
};

export function qualityLabel(quality: ChordQuality): string {
  return QUALITY_LABELS[quality];
}
