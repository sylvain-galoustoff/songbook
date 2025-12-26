import { useAudio } from "../../context/AudioContext";
import styles from "./Version.module.css";
import { IoPlay } from "react-icons/io5";

interface VersionProps {
  versionNumber: number;
  date: any;
  fileUrl: string;
}

export default function Version({
  versionNumber,
  date,
  fileUrl,
}: VersionProps) {
  const { playAudio, currentVersion, isPlaying } = useAudio();

  const handleClick = () => {
    playAudio(fileUrl, { versionNumber });
  };

  const isCurrent =
    currentVersion?.versionNumber === versionNumber && isPlaying;

  return (
    <div className={styles.version} onClick={handleClick}>
      <IoPlay
        className={`${styles.playIcon} ${isCurrent ? styles.show : ""}`}
      />
      <p className={styles.versionNumber}>Version {versionNumber}</p>
      <p className={styles.date}>
        {date?.toDate ? date.toDate().toLocaleDateString("fr-FR") : ""}
      </p>
    </div>
  );
}
