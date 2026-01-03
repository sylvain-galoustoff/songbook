import { useAudio } from "../../context/AudioContext";
import styles from "./Version.module.css";
import { IoPlay, IoEllipsisVertical } from "react-icons/io5";

interface VersionProps {
  versionNumber: number;
  versionId: string;
  date: any;
  fileUrl: string;
  deleteVersionId: (id: string) => void;
}

export default function Version({
  versionId,
  versionNumber,
  date,
  fileUrl,
  deleteVersionId,
}: VersionProps) {
  const { playAudio, currentVersion, setVersionId } = useAudio();

  const handleClick = () => {
    playAudio(fileUrl, { versionNumber });
    setVersionId(versionId);
  };

  const deleteVersion = () => {
    deleteVersionId(versionId);
  };

  const isCurrent = currentVersion?.versionNumber === versionNumber;

  return (
    <div className={styles.version}>
      <IoPlay
        className={`${styles.playIcon} ${isCurrent ? styles.show : ""}`}
      />
      <p className={styles.versionNumber} onClick={handleClick}>
        Version {versionNumber}
      </p>
      <p className={styles.date}>
        {date?.toDate ? date.toDate().toLocaleDateString("fr-FR") : ""}
      </p>
      <IoEllipsisVertical
        className={styles.moreButton}
        onClick={deleteVersion}
      />
    </div>
  );
}
