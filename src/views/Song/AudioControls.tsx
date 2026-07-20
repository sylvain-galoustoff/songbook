import type { MouseEvent } from "react";
import { IoRepeat, IoRepeatOutline, IoPlay, IoPause } from "react-icons/io5";
import type { LoopRange } from "../../audio/audioEngine";
import styles from "./AudioControls.module.scss";

interface AudioControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  progress: number;
  durationSamples: number;
  loop: LoopRange;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  onToggleLoop: () => void;
}

// Le bouton boucle a 3 états, chacun reflété par l'icône/label affiché (cf.
// audio-engine.md « Boucle A→B ») : rien défini → pose A, A défini → pose B
// (active la boucle), A+B définis → un 3e appui efface tout.
type LoopStep = "none" | "pointA" | "active";

function getLoopStep({ start, end }: LoopRange): LoopStep {
  if (start === null) return "none";
  return end === null ? "pointA" : "active";
}

const LOOP_LABELS: Record<LoopStep, string> = {
  none: "Poser le point A de la boucle",
  pointA: "Poser le point B de la boucle",
  active: "Supprimer la boucle",
};

export const AudioControls = ({
  isPlaying,
  disabled,
  progress,
  durationSamples,
  loop,
  onTogglePlay,
  onSeek,
  onToggleLoop,
}: AudioControlsProps) => {
  const fillPercent = Math.min(1, Math.max(0, progress)) * 100;
  const loopStep = getLoopStep(loop);
  const loopStartPercent =
    loop.start !== null && durationSamples > 0 ? (loop.start / durationSamples) * 100 : null;
  const loopEndPercent =
    loop.end !== null && durationSamples > 0 ? (loop.end / durationSamples) * 100 : null;

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled || durationSamples <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(Math.round(ratio * durationSamples));
  };

  const loopButtonClassName =
    loopStep === "none"
      ? styles.loopButton
      : loopStep === "pointA"
        ? `${styles.loopButton} ${styles.loopButtonPending}`
        : `${styles.loopButton} ${styles.loopButtonActive}`;

  return (
    <div className={styles.AudioControls}>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={styles.playButton}
          disabled={disabled}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? <IoPause size={68} /> : <IoPlay size={68} />}
        </button>
        <button
          type="button"
          className={loopButtonClassName}
          disabled={disabled}
          onClick={onToggleLoop}
          aria-label={LOOP_LABELS[loopStep]}
          aria-pressed={loopStep !== "none"}
        >
          {loopStep === "none" ? <IoRepeatOutline size={34} /> : <IoRepeat size={34} />}
          {loopStep === "pointA" && <span className={styles.loopBadge}>A</span>}
        </button>
      </div>
      <div
        className={styles.progress}
        role="slider"
        aria-label="Position de lecture"
        aria-valuemin={0}
        aria-valuemax={durationSamples}
        aria-valuenow={Math.round(progress * durationSamples)}
        onClick={handleSeek}
      >
        <div className={styles.progressFill} style={{ width: `${fillPercent}%` }} />
        {loopStartPercent !== null && loopEndPercent !== null && (
          <div
            className={styles.loopRange}
            style={{ left: `${loopStartPercent}%`, width: `${loopEndPercent - loopStartPercent}%` }}
          />
        )}
        {loopStartPercent !== null && loopEndPercent === null && (
          <div className={styles.loopMarker} style={{ left: `${loopStartPercent}%` }} />
        )}
      </div>
    </div>
  );
};

export default AudioControls;
