import { createContext, useContext } from "react";
import type { InstrumentId } from "../types/instrument";

export interface NewSongWizardState {
  songTitle: string;
  setSongTitle: (title: string) => void;
  trackFile: File | null;
  setTrackFile: (file: File | null) => void;
  trackInstrument: InstrumentId | null;
  setTrackInstrument: (instrument: InstrumentId | null) => void;
}

export const NewSongWizardContext = createContext<NewSongWizardState | null>(null);

export const useNewSongWizard = (): NewSongWizardState => {
  const context = useContext(NewSongWizardContext);

  if (!context) {
    throw new Error("useNewSongWizard must be used within a NewSongWizardProvider");
  }

  return context;
};
