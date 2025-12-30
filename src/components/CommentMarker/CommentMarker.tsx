import { formatMinutesSeconds } from "../../utils/formatTime";
import styles from "./CommentMarker.module.css";
import { IoChatbox, IoChatboxOutline } from "react-icons/io5";

interface CommentMarkerProps {
  timecode: number;
  index: number;
  isActive?: boolean;
  setMarkerActive: (index: number, timecode: number) => void;
}

export default function CommentMarker({
  timecode,
  index,
  isActive = false,
  setMarkerActive,
}: CommentMarkerProps) {
  return (
    <div
      className={`${styles.marker} ${isActive ? styles.active : undefined}`}
      onClick={() => setMarkerActive(index, timecode)}
    >
      <p className={styles.text}>
        <IoChatbox />
        {formatMinutesSeconds(timecode)}
      </p>
    </div>
  );
}
