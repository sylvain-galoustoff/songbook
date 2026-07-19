import {
  IoRepeat,
  IoPlaySkipBack,
  IoPlayBack,
  IoPlay,
  IoPlayForward,
  IoPlaySkipForward,
} from "react-icons/io5";
import styles from "./AudioControls.module.scss";

export const AudioControls = () => {
  return (
    <div className={styles.AudioControls}>
      <div className={styles.loopRow}>
        <button type="button" className={styles.loopButton} aria-label="Boucle A-B">
          <IoRepeat size={20} />
        </button>
      </div>
      <div className={styles.transportRow}>
        <button type="button" className={styles.transportButton} aria-label="Piste précédente">
          <IoPlaySkipBack size={20} />
        </button>
        <button type="button" className={styles.transportButton} aria-label="Reculer">
          <IoPlayBack size={34} />
        </button>
        <button type="button" className={styles.playButton} aria-label="Lecture">
          <IoPlay size={68} />
        </button>
        <button type="button" className={styles.transportButton} aria-label="Avancer">
          <IoPlayForward size={34} />
        </button>
        <button type="button" className={styles.transportButton} aria-label="Piste suivante">
          <IoPlaySkipForward size={20} />
        </button>
      </div>
      <div className={styles.progress}>
        <div className={styles.progressFill} style={{ width: "50%" }} />
      </div>
    </div>
  );
};

export default AudioControls;
