import { formatMinutesSeconds } from "../../utils/formatTime";
import styles from "./CommentMarker.module.css";
import { IoChatbox, IoChatboxOutline } from "react-icons/io5";

interface CommentMarkerProps {
  timecode: number;
  isActive?: boolean;
}

export default function CommentMarker({
  timecode,
  isActive = false,
}: CommentMarkerProps) {
  return (
    <div className={`${styles.marker} ${isActive ? styles.active : undefined}`}>
      {isActive ? (
        <IoChatbox className={styles.icon} />
      ) : (
        <IoChatboxOutline className={styles.icon} />
      )}
      <p className={styles.text}>
        <span className={styles.value}>{formatMinutesSeconds(timecode)}</span>
      </p>
    </div>
  );
}
