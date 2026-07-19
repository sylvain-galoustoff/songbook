import {
  IoRepeat,
  IoPlaySkipBack,
  IoPlayBack,
  IoPlay,
  IoPause,
  IoPlayForward,
  IoPlaySkipForward,
} from "react-icons/io5";
import styles from "./AudioControls.module.scss";

interface AudioControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  progress: number;
  onTogglePlay: () => void;
}

export const AudioControls = ({ isPlaying, disabled, progress, onTogglePlay }: AudioControlsProps) => {
  const fillPercent = Math.min(1, Math.max(0, progress)) * 100;

  return (
    <div className={styles.AudioControls}>
      <div className={styles.loopRow}>
        <button type="button" className={styles.loopButton} disabled={disabled} aria-label="Boucle A-B">
          <IoRepeat size={20} />
        </button>
      </div>
      <div className={styles.transportRow}>
        <button
          type="button"
          className={styles.transportButton}
          disabled={disabled}
          aria-label="Piste précédente"
        >
          <IoPlaySkipBack size={20} />
        </button>
        <button type="button" className={styles.transportButton} disabled={disabled} aria-label="Reculer">
          <IoPlayBack size={34} />
        </button>
        <button
          type="button"
          className={styles.playButton}
          disabled={disabled}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? <IoPause size={68} /> : <IoPlay size={68} />}
        </button>
        <button type="button" className={styles.transportButton} disabled={disabled} aria-label="Avancer">
          <IoPlayForward size={34} />
        </button>
        <button
          type="button"
          className={styles.transportButton}
          disabled={disabled}
          aria-label="Piste suivante"
        >
          <IoPlaySkipForward size={20} />
        </button>
      </div>
      <div className={styles.progress}>
        <div className={styles.progressFill} style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
};

export default AudioControls;
