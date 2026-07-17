import { useEffect, useRef, useState } from "react";
import { AudioEngine, type TrackSource } from "../audio/audioEngine";

const TRACK_SOURCES: TrackSource[] = [
  { id: "guitar", url: "/guitar.mp3" },
  { id: "basse", url: "/basse.mp3" },
  { id: "batterie", url: "/batterie.mp3" },
];

export type PlaybackStatus = "loading" | "ready" | "error";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Garde anti-StrictMode : ignore la résolution d'un engine déjà nettoyé
    // par le double montage/démontage des effets en dev.
    let cancelled = false;
    const engine = new AudioEngine();
    engineRef.current = engine;

    engine
      .loadTracks(TRACK_SOURCES)
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      engine.dispose();
    };
  }, []);

  const togglePlayPause = () => {
    const engine = engineRef.current;
    if (!engine || status !== "ready") return;

    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      void engine.play();
      setIsPlaying(true);
    }
  };

  return { status, isPlaying, togglePlayPause };
}
