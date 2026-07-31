import { createContext, useContext } from "react";
import type { InstrumentId } from "../types/instrument";
import type { TrackModeChoice, WizardTrack } from "../types/track";
import type { ValidatedTrackMetadata } from "../audio/trackValidation";

export interface NewSongWizardState {
  songTitle: string;
  setSongTitle: (title: string) => void;
  trackMode: TrackModeChoice | null;
  setTrackMode: (mode: TrackModeChoice | null) => void;
  trackFile: File | null;
  setTrackFile: (file: File | null) => void;
  trackFileMetadata: ValidatedTrackMetadata | null;
  setTrackFileMetadata: (metadata: ValidatedTrackMetadata | null) => void;
  trackInstrument: InstrumentId | null;
  setTrackInstrument: (instrument: InstrumentId | null) => void;
  tracks: WizardTrack[];
  confirmTrack: () => void;
}

export const NewSongWizardContext = createContext<NewSongWizardState | null>(null);

export const useNewSongWizard = (): NewSongWizardState => {
  const context = useContext(NewSongWizardContext);

  if (!context) {
    throw new Error("useNewSongWizard must be used within a NewSongWizardProvider");
  }

  return context;
};
