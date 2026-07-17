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
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // Garde anti-StrictMode : ignore la résolution d'un engine déjà nettoyé
    // par le double montage/démontage des effets en dev.
    let cancelled = false;
    const engine = new AudioEngine();
    engineRef.current = engine;
    engine.setPositionListener((index) => setPosition(index));

    engine
      .loadTracks(TRACK_SOURCES)
      .then(() => {
        if (!cancelled) {
          setStatus("ready");
          setDuration(engine.getDurationSamples());
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      engine.setPositionListener(null);
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

  const toggleTrackMute = (id: string) => {
    const engine = engineRef.current;
    if (!engine || status !== "ready") return;

    // Le mute est indépendant de play/pause : il n'y touche jamais.
    const muted = !mutedTracks[id];
    engine.setTrackMuted(id, muted);
    setMutedTracks((prev) => ({ ...prev, [id]: muted }));
  };

  // Pendant le glissement, la position affichée suit le doigt/curseur plutôt
  // que les messages "position" du worklet (qui arriveraient en retard).
  const seek = (index: number) => {
    const engine = engineRef.current;
    if (!engine || status !== "ready") return;
    setIsSeeking(true);
    setPosition(index);
    engine.seek(index);
  };

  const commitSeek = () => setIsSeeking(false);

  return {
    status,
    isPlaying,
    togglePlayPause,
    tracks: TRACK_SOURCES,
    mutedTracks,
    toggleTrackMute,
    position,
    duration,
    isSeeking,
    seek,
    commitSeek,
  };
}
