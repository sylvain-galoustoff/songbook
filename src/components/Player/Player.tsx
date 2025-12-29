import { useAudio } from "../../context/AudioContext";
import styles from "./Player.module.css";
import { IoPlay, IoPause, IoChatbox } from "react-icons/io5";
import { useEffect, useState, useRef } from "react";

export default function Player() {
  const { currentAudio, isPlaying, togglePlay } = useAudio();
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const handleClickProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentAudio || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // position du clic dans la barre
    const newTime = (clickX / rect.width) * currentAudio.duration;

    currentAudio.currentTime = newTime;
    setProgress((newTime / currentAudio.duration) * 100);
  };

  const addComment = () => {
    console.log("add comment");
  };

  return (
    <div className={styles.player}>
      <IoChatbox className={styles.commentsIcon} onClick={addComment} />
      {isPlaying ? (
        <IoPause className={styles.playIcon} onClick={togglePlay} />
      ) : (
        <IoPlay className={styles.playIcon} onClick={togglePlay} />
      )}
      <div
        className={styles.progressBar}
        ref={progressBarRef}
        onClick={handleClickProgress}
      >
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
