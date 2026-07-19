import { useState, type ReactNode } from "react";
import { NewSongWizardContext } from "./useNewSongWizard";

export const NewSongWizardProvider = ({ children }: { children: ReactNode }) => {
  const [songTitle, setSongTitle] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);

  return (
    <NewSongWizardContext.Provider
      value={{ songTitle, setSongTitle, trackFile, setTrackFile }}
    >
      {children}
    </NewSongWizardContext.Provider>
  );
};
