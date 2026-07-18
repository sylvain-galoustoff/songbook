import { SAMPLE_RATE } from "../../audio/audioEngine";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import "./PlaybackPoc.scss";

const LABELS = {
  loading: "Chargement…",
  error: "Erreur de chargement",
} as const;

function formatTime(samples: number): string {
  const totalSeconds = Math.floor(samples / SAMPLE_RATE);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlaybackPoc() {
  const {
    status,
    isPlaying,
    togglePlayPause,
    tracks,
    mutedTracks,
    toggleTrackMute,
    position,
    duration,
    seek,
    commitSeek,
    loop,
    toggleLoop,
  } = useAudioEngine();

  const playLabel =
    status === "ready" ? (isPlaying ? "Pause" : "Lecture") : LABELS[status];

  const loopLabel =
    loop.start === null ? "Boucle A" : loop.end === null ? "Boucle B" : "Boucle ⏹";
  const loopActive = loop.start !== null && loop.end !== null;

  return (
    <div className="playback-poc">
      <button type="button" onClick={togglePlayPause} disabled={status !== "ready"}>
        {playLabel}
      </button>

      <div className="seek-bar">
        <span>{formatTime(position)}</span>
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration - 1 : 0}
          value={position}
          onChange={(event) => seek(Number(event.target.value))}
          onPointerUp={commitSeek}
          disabled={status !== "ready"}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <button
        type="button"
        className={`loop-button${loopActive ? " active" : ""}`}
        onClick={toggleLoop}
        disabled={status !== "ready"}
      >
        {loopLabel}
      </button>

      <div className="track-mutes">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            className={mutedTracks[track.id] ? "muted" : ""}
            onClick={() => toggleTrackMute(track.id)}
            disabled={status !== "ready"}
          >
            {track.id}
          </button>
        ))}
      </div>
    </div>
  );
}
