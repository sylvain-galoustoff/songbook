import { useEffect, useRef, useState } from "react";
import { AudioEngine, type LoopRange, type TrackSource } from "../audio/audioEngine";
import { StaticTrackProvider, type TrackRequest } from "../audio/trackProvider";

const TRACK_REQUESTS: TrackRequest[] = [
  { id: "Batterie", instrument: "Batterie" },
  { id: "Chant1", instrument: "Chant1" },
  { id: "Clavier", instrument: "Clavier" },
  { id: "Guitare", instrument: "Guitare" },
];

export type PlaybackStatus = "loading" | "ready" | "error";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const providerRef = useRef(new StaticTrackProvider());
  const [status, setStatus] = useState<PlaybackStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loop, setLoop] = useState<LoopRange>({ start: null, end: null });
  const [tracks, setTracks] = useState<TrackSource[]>(() =>
    TRACK_REQUESTS.map((request) => ({
      id: request.id,
      instrument: request.instrument,
      durationSamples: 0,
      channels: 0,
    })),
  );

  useEffect(() => {
    // Garde anti-StrictMode : ignore la résolution d'un engine déjà nettoyé
    // par le double montage/démontage des effets en dev.
    let cancelled = false;
    const engine = new AudioEngine();
    engineRef.current = engine;
    engine.setPositionListener((index) => setPosition(index));
    engine.setLoopListener((range) => setLoop(range));

    engine
      .loadTracks(TRACK_REQUESTS, providerRef.current)
      .then((loadedTracks) => {
        if (!cancelled) {
          setTracks(loadedTracks);
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
      engine.setLoopListener(null);
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

  // Pas de mise à jour optimiste ici : le worklet est seul juge de l'état de
  // boucle (ex. une pression sur B peut être invalidée et renvoyer A seul).
  const toggleLoop = () => {
    const engine = engineRef.current;
    if (!engine || status !== "ready") return;
    engine.toggleLoopPoint();
  };

  return {
    status,
    isPlaying,
    togglePlayPause,
    tracks,
    mutedTracks,
    toggleTrackMute,
    position,
    duration,
    isSeeking,
    seek,
    commitSeek,
    loop,
    toggleLoop,
  };
}
