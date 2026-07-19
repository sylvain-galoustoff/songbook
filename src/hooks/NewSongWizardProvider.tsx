import { useState, type ReactNode } from "react";
import { NewSongWizardContext } from "./useNewSongWizard";
import type { InstrumentId } from "../types/instrument";
import type { WizardTrack } from "../types/track";

export const NewSongWizardProvider = ({ children }: { children: ReactNode }) => {
  const [songTitle, setSongTitle] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackInstrument, setTrackInstrument] = useState<InstrumentId | null>(null);
  const [tracks, setTracks] = useState<WizardTrack[]>([]);

  const confirmTrack = () => {
    if (!trackFile || !trackInstrument) {
      return;
    }

    setTracks((prev) => [...prev, { file: trackFile, instrument: trackInstrument }]);
    setTrackFile(null);
    setTrackInstrument(null);
  };

  return (
    <NewSongWizardContext.Provider
      value={{
        songTitle,
        setSongTitle,
        trackFile,
        setTrackFile,
        trackInstrument,
        setTrackInstrument,
        tracks,
        confirmTrack,
      }}
    >
      {children}
    </NewSongWizardContext.Provider>
  );
};
