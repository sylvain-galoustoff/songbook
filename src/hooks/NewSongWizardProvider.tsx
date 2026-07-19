import { useState, type ReactNode } from "react";
import { NewSongWizardContext } from "./useNewSongWizard";
import type { InstrumentId } from "../types/instrument";
import type { WizardTrack } from "../types/track";
import type { ValidatedTrackMetadata } from "../audio/trackValidation";

export const NewSongWizardProvider = ({ children }: { children: ReactNode }) => {
  const [songTitle, setSongTitle] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackFileMetadata, setTrackFileMetadata] = useState<ValidatedTrackMetadata | null>(null);
  const [trackInstrument, setTrackInstrument] = useState<InstrumentId | null>(null);
  const [tracks, setTracks] = useState<WizardTrack[]>([]);

  const confirmTrack = () => {
    if (!trackFile || !trackFileMetadata || !trackInstrument) {
      return;
    }

    setTracks((prev) => [
      ...prev,
      { file: trackFile, instrument: trackInstrument, metadata: trackFileMetadata },
    ]);
    setTrackFile(null);
    setTrackFileMetadata(null);
    setTrackInstrument(null);
  };

  return (
    <NewSongWizardContext.Provider
      value={{
        songTitle,
        setSongTitle,
        trackFile,
        setTrackFile,
        trackFileMetadata,
        setTrackFileMetadata,
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
