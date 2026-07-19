import { useState, type ReactNode } from "react";
import { NewSongWizardContext } from "./useNewSongWizard";
import type { InstrumentId } from "../types/instrument";

export const NewSongWizardProvider = ({ children }: { children: ReactNode }) => {
  const [songTitle, setSongTitle] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackInstrument, setTrackInstrument] = useState<InstrumentId | null>(null);

  return (
    <NewSongWizardContext.Provider
      value={{
        songTitle,
        setSongTitle,
        trackFile,
        setTrackFile,
        trackInstrument,
        setTrackInstrument,
      }}
    >
      {children}
    </NewSongWizardContext.Provider>
  );
};
