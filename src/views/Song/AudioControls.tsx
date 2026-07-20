import type { MouseEvent } from "react";
import { IoRepeat, IoPlay, IoPause } from "react-icons/io5";
import styles from "./AudioControls.module.scss";

interface AudioControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  progress: number;
  durationSamples: number;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
}

export const AudioControls = ({
  isPlaying,
  disabled,
  progress,
  durationSamples,
  onTogglePlay,
  onSeek,
}: AudioControlsProps) => {
  const fillPercent = Math.min(1, Math.max(0, progress)) * 100;

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || durationSamples <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * durationSamples));
  };

  return (
    <div className={styles.AudioControls}>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={styles.playButton}
          disabled={disabled}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? <IoPause size={68} /> : <IoPlay size={68} />}
        </button>
        <button type="button" className={styles.loopButton} disabled={disabled} aria-label="Boucle A-B">
          <IoRepeat size={34} />
        </button>
      </div>
      <div
        className={styles.progress}
        role="slider"
        aria-label="Position de lecture"
        aria-valuemin={0}
        aria-valuemax={durationSamples}
        aria-valuenow={Math.round(progress * durationSamples)}
        onClick={handleSeek}
      >
        <div className={styles.progressFill} style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
};

export default AudioControls;
