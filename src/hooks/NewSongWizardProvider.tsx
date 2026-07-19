import { useState, type ReactNode } from "react";
import { NewSongWizardContext } from "./useNewSongWizard";

export const NewSongWizardProvider = ({ children }: { children: ReactNode }) => {
  const [songTitle, setSongTitle] = useState("");

  return (
    <NewSongWizardContext.Provider value={{ songTitle, setSongTitle }}>
      {children}
    </NewSongWizardContext.Provider>
  );
};
