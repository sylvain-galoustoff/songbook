import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioEngine,
  TrackLoadError,
  type LoopRange,
  type TrackSource,
} from "../audio/audioEngine";
import { FirebaseTrackProvider, type TrackRequest } from "../audio/trackProvider";
import type { TrackMeta } from "../firebase/songs";

// "idle" : pas de morceau jouable (aucun songId, ou pistes pas encore
// connues) — distinct de "loading" pour ne pas afficher un état de
// chargement audio avant même de savoir quel morceau charger.
export type PlaybackStatus = "idle" | "loading" | "ready" | "error";

function toTrackRequest(track: TrackMeta): TrackRequest {
  return { id: track.id, instrument: track.instrument };
}

// Charge et joue les pistes réelles d'un morceau (Firestore + Storage, cf.
// .claude/rules/audio-engine.md). `songId`/`trackMetas` proviennent du
// document Firestore du morceau ; passer `null`/`[]` tant qu'il n'est pas
// encore chargé ou jouable.
export function useAudioEngine(songId: string | null, trackMetas: TrackMeta[]) {
  const engineRef = useRef<AudioEngine | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loop, setLoop] = useState<LoopRange>({ start: null, end: null });
  const [tracks, setTracks] = useState<TrackSource[]>([]);

  const trackRequests = useMemo(() => trackMetas.map(toTrackRequest), [trackMetas]);

  useEffect(() => {
    let cancelled = false;

    if (!songId || trackRequests.length === 0) {
      // setState différé au micro-tâche suivante : un effet ne doit pas
      // déclencher de re-render synchrone dans son propre corps (cascading
      // renders). Même contrainte plus bas pour la branche de chargement.
      Promise.resolve().then(() => {
        if (!cancelled) {
          setStatus("idle");
          setTracks([]);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    // Garde anti-StrictMode : ignore la résolution d'un engine déjà nettoyé
    // par le double montage/démontage des effets en dev.
    const engine = new AudioEngine();
    engineRef.current = engine;
    engine.setPositionListener((index) => setPosition(index));
    engine.setLoopListener((range) => setLoop(range));

    const provider = new FirebaseTrackProvider(songId);
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setStatus("loading");
        setLoadError(null);
        setIsPlaying(false);
        setMutedTracks({});
        setPosition(0);
        setDuration(0);
        setTracks(
          trackRequests.map((request) => ({
            id: request.id,
            instrument: request.instrument,
            durationSamples: 0,
            channels: 0,
          })),
        );
      })
      .then(() => engine.loadTracks(trackRequests, provider))
      .then((loadedTracks) => {
        if (!cancelled) {
          setTracks(loadedTracks);
          setStatus("ready");
          setDuration(engine.getDurationSamples());
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof TrackLoadError
              ? error.message
              : "Erreur de chargement.",
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      engine.setPositionListener(null);
      engine.setLoopListener(null);
      engine.dispose();
      engineRef.current = null;
    };
  }, [songId, trackRequests]);

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
    loadError,
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
