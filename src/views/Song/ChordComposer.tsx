import { useState } from "react";
import { IoClose } from "react-icons/io5";
import type { Chord, ChordQuality } from "../../types/chord";
import { qualityLabel, rootLabel } from "../../types/chord";
import styles from "./ChordComposer.module.scss";

// Rangées 1+2 = les 12 demi-tons (docs/chords-feature.md §5), séparés en
// naturelles et altérées pour l'agencement visuel — jamais de libellé en dur,
// tout passe par rootLabel.
const NATURAL_ROOTS = [0, 2, 4, 5, 7, 9, 11];
const SHARP_ROOTS = [1, 3, 6, 8, 10];

// Qualités du tiroir "Autre" : toutes les qualités sauf maj/min, déjà posées
// par les boutons Majeur/Mineur de la rangée 3.
const EXTENDED_QUALITIES: ChordQuality[] = [
  "7",
  "m7",
  "maj7",
  "sus2",
  "sus4",
  "dim",
  "aug",
  "add9",
  "6",
  "m6",
  "9",
];

interface ChordComposerProps {
  activeSectionName: string;
  onAddChord: (chord: Chord) => void;
}

export const ChordComposer = ({ activeSectionName, onAddChord }: ChordComposerProps) => {
  const [armedRoot, setArmedRoot] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Re-tap sur la note déjà armée -> désarme sans poser (docs/chords-feature.md §5).
  const handleTapRoot = (root: number) => {
    setArmedRoot((current) => (current === root ? null : root));
  };

  // Saisie deux-temps : la pose n'arrive qu'ici, jamais sur le seul tap
  // d'une note (garde-fou tap fantôme).
  const handlePose = (quality: ChordQuality) => {
    if (armedRoot === null) return;
    onAddChord({ root: armedRoot, quality });
    setArmedRoot(null);
    setIsDrawerOpen(false);
  };

  const renderRootButton = (root: number) => {
    const isArmed = armedRoot === root;
    return (
      <button
        key={root}
        type="button"
        className={isArmed ? `${styles.noteButton} ${styles.armed}` : styles.noteButton}
        aria-pressed={isArmed}
        onClick={() => handleTapRoot(root)}
      >
        {rootLabel(root)}
      </button>
    );
  };

  return (
    <div className={styles.ChordComposer}>
      <div className={styles.header}>
        <span className={styles.target}>Ajout dans : {activeSectionName}</span>
        <span className={styles.preview}>
          {armedRoot !== null ? `${rootLabel(armedRoot)} …` : "Choisis une note"}
        </span>
      </div>
      <div className={styles.row}>{NATURAL_ROOTS.map(renderRootButton)}</div>
      <div className={styles.row}>{SHARP_ROOTS.map(renderRootButton)}</div>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.qualityButton}
          disabled={armedRoot === null}
          onClick={() => handlePose("maj")}
        >
          Majeur
        </button>
        <button
          type="button"
          className={styles.qualityButton}
          disabled={armedRoot === null}
          onClick={() => handlePose("min")}
        >
          Mineur
        </button>
        <button
          type="button"
          className={styles.qualityButton}
          disabled={armedRoot === null}
          onClick={() => setIsDrawerOpen(true)}
        >
          Autre
        </button>
      </div>
      {isDrawerOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>Autre qualité</span>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Fermer le tiroir des qualités"
              onClick={() => setIsDrawerOpen(false)}
            >
              <IoClose size={24} />
            </button>
          </div>
          <div className={styles.drawerGrid}>
            {EXTENDED_QUALITIES.map((quality) => (
              <button
                key={quality}
                type="button"
                className={styles.qualityButton}
                onClick={() => handlePose(quality)}
              >
                {qualityLabel(quality)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordComposer;
