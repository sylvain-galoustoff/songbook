export type InstrumentId = "drums" | "bass" | "guitar" | "keyboard" | "vocals";

export interface Instrument {
  id: InstrumentId;
  label: string;
}

export const INSTRUMENTS: Instrument[] = [
  { id: "drums", label: "Batterie" },
  { id: "bass", label: "Basse" },
  { id: "guitar", label: "Guitare" },
  { id: "keyboard", label: "Clavier" },
  { id: "vocals", label: "Micro" },
];
