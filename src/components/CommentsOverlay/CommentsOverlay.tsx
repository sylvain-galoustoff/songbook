import { IoSend } from "react-icons/io5";
import { formatMinutesSeconds } from "../../utils/formatTime";
import styles from "./CommentsOverlay.module.css";

interface CommentsOverlayProps {
  timecode: number;
}

export default function CommentsOverlay({ timecode }: CommentsOverlayProps) {
  return (
    <div className={styles.commentsOverlay}>
      <header className="toast">
        <h2>Commentaires à {formatMinutesSeconds(timecode)}</h2>
      </header>
      <div className={styles.body}>
        <div className={styles.commentsList}>
          <p>Aucun commentaire</p>
        </div>
        <div className={styles.addComment}>
          <textarea rows={3} placeholder="Ajouter un commentaire…" />
          <div className={styles.sendIconWrapper}>
            <IoSend className={styles.sendIcon} />
          </div>
        </div>
      </div>
    </div>
  );
}
