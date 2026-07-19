import { IoDisc } from "react-icons/io5";
import styles from "./Loader.module.scss";

interface LoaderProps {
  message: string;
  // 0..1 pour une progression réelle connue (barre déterministe) ; omis
  // quand il n'y a pas de progression fine à ce stade (cf.
  // .claude/rules/audio-engine.md — le décodage n'en a pas) : la barre reste
  // toujours affichée, juste en mode indéterminé, pour ne jamais faire
  // varier la hauteur du loader d'une phase à l'autre (évite les
  // sautillements des éléments autour).
  progress?: number;
}

export const Loader = ({ message, progress }: LoaderProps) => {
  const determinate = progress !== undefined;

  return (
    <div className={styles.Loader} role="status" aria-live="polite">
      <IoDisc className={styles.spinner} size={48} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      <div className={styles.progressTrack}>
        <div
          className={determinate ? styles.progressFill : `${styles.progressFill} ${styles.indeterminate}`}
          style={
            determinate
              ? { width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default Loader;
