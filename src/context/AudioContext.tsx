import { createContext, useContext, useState, type ReactNode } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";

interface VersionInfo {
  title?: string;
  versionNumber: number;
}

interface AudioContextType {
  currentAudio: HTMLAudioElement | null;
  currentVersion: VersionInfo | null;
  versionId: string | undefined;
  setVersionId: (id: string) => void;
  isPlaying: boolean;
  playAudio: (audioPath: string, version: VersionInfo) => void;
  togglePlay: () => void;
  seekTo: (timecode: number) => void;
  trackTitle: string;
  setTrackTitle: (title: string) => void;
  resetAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(
    null
  );
  const [versionId, setVersionId] = useState<string | undefined>(undefined);
  const [trackTitle, setTrackTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const resetAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
    }
    setCurrentAudio(null);
    setCurrentVersion(null);
    setVersionId(undefined);
    setIsPlaying(false);
    setTrackTitle("");
    audioCache.clear(); // si tu veux aussi vider le cache
  };

  // Cache pour stocker les URLs des fichiers déjà téléchargés
  const audioCache = useState<Map<string, string>>(() => new Map())[0];

  const playAudio = async (audioPath: string, version: VersionInfo) => {
    try {
      // Vérifie si le fichier est déjà dans le cache
      let url = audioCache.get(audioPath);
      if (!url) {
        // Téléchargement du fichier depuis Firebase Storage
        const fileRef = ref(storage, audioPath);
        url = await getDownloadURL(fileRef);
        audioCache.set(audioPath, url);
      }

      // Si un audio est déjà en lecture, on le stoppe
      if (currentAudio) {
        currentAudio.pause();
      }

      // Crée et joue l'audio
      const audio = new Audio(url);
      audio.play();
      setCurrentAudio(audio);
      setCurrentVersion(version);
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
    } catch (err) {
      console.error("Erreur lecture audio :", err);
    }
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

  const seekTo = (timecode: number) => {
    if (!currentAudio) return;

    currentAudio.currentTime = timecode;

    if (!isPlaying) {
      currentAudio.play();
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        currentVersion,
        versionId,
        setVersionId,
        isPlaying,
        playAudio,
        togglePlay,
        seekTo,
        trackTitle,
        setTrackTitle,
        resetAudio,
      }}
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
