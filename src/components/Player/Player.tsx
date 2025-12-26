import { useAudio } from "../../context/AudioContext";
import styles from "./Player.module.css";
import { IoPlay, IoPause, IoChatbox } from "react-icons/io5";
import { useEffect, useState } from "react";

export default function Player() {
  const { currentAudio, currentVersion, isPlaying, togglePlay } = useAudio();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!currentAudio) return;

    const updateProgress = () => {
      if (currentAudio.duration) {
        setProgress((currentAudio.currentTime / currentAudio.duration) * 100);
      }
    };

    currentAudio.addEventListener("timeupdate", updateProgress);

    return () => {
      currentAudio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentAudio]);

  return (
    <div className={styles.player}>
      <IoChatbox className={styles.commentsIcon} />
      {isPlaying ? (
        <IoPause className={styles.playIcon} onClick={togglePlay} />
      ) : (
        <IoPlay className={styles.playIcon} onClick={togglePlay} />
      )}
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.currentTime}>
        {currentAudio
          ? `${Math.floor(currentAudio.currentTime / 60)}:${Math.floor(
              currentAudio.currentTime % 60
            )
              .toString()
              .padStart(2, "0")}`
          : "0:00"}
      </p>
    </div>
  );
}
