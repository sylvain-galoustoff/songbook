import { useAudioEngine } from "../../hooks/useAudioEngine";
import "./PlaybackPoc.scss";

const LABELS = {
  loading: "Chargement…",
  error: "Erreur de chargement",
} as const;

export function PlaybackPoc() {
  const { status, isPlaying, togglePlayPause } = useAudioEngine();

  const label =
    status === "ready" ? (isPlaying ? "Pause" : "Lecture") : LABELS[status];

  return (
    <div className="playback-poc">
      <button type="button" onClick={togglePlayPause} disabled={status !== "ready"}>
        {label}
      </button>
    </div>
  );
}
