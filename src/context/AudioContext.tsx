import { createContext, useContext, useState, type ReactNode } from "react";

interface AudioContextType {
  currentAudio: HTMLAudioElement | null;
  currentVersion: { versionNumber: number; title?: string } | null;
  isPlaying: boolean;
  playAudio: (
    url: string,
    version: { versionNumber: number; title?: string }
  ) => void;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [currentVersion, setCurrentVersion] = useState<{
    versionNumber: number;
    title?: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (
    url: string,
    version: { versionNumber: number; title?: string }
  ) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    audio.play();
    setCurrentAudio(audio);
    setCurrentVersion(version);
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      currentAudio.play();
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{ currentAudio, currentVersion, isPlaying, playAudio, togglePlay }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context)
    throw new Error("useAudio must be used within an AudioProvider");
  return context;
}
