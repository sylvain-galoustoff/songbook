import { IoDisc } from "react-icons/io5";
import styles from "./Loader.module.scss";

interface LoaderProps {
  message: string;
  // 0..1 ; omis quand il n'y a pas de progression réelle à refléter (cf.
  // .claude/rules/audio-engine.md : le décodage n'a pas de progression fine).
  progress?: number;
}

export const Loader = ({ message, progress }: LoaderProps) => {
  return (
    <div className={styles.Loader} role="status" aria-live="polite">
      <IoDisc className={styles.spinner} size={48} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      {progress !== undefined && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Loader;
