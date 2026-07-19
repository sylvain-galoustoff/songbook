import { createContext, useContext } from "react";

export interface NewSongWizardState {
  songTitle: string;
  setSongTitle: (title: string) => void;
  trackFile: File | null;
  setTrackFile: (file: File | null) => void;
}

export const NewSongWizardContext = createContext<NewSongWizardState | null>(null);

export const useNewSongWizard = (): NewSongWizardState => {
  const context = useContext(NewSongWizardContext);

  if (!context) {
    throw new Error("useNewSongWizard must be used within a NewSongWizardProvider");
  }

  return context;
};
