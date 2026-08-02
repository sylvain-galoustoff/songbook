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
// Title case (docs/chords-feature.md §7, polish maquette) : c'est la casse
// affichée partout (cartes, aperçu du compositeur) ; seuls les boutons de
// note du compositeur la remontent en majuscules, par CSS (text-transform),
// jamais en réécrivant le libellé ici.
const ROOT_LABELS: Record<number, string> = {
  0: "Do",
  1: "Do♯",
  2: "Re",
  3: "Re♯",
  4: "Mi",
  5: "Fa",
  6: "Fa♯",
  7: "Sol",
  8: "Sol♯",
  9: "La",
  10: "La♯",
  11: "Si",
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
