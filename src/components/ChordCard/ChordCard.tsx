import type { KeyboardEvent, MouseEvent } from "react";
import { IoCloseCircle } from "react-icons/io5";
import type { Chord } from "../../types/chord";
import { qualityLabel, rootLabel } from "../../types/chord";
import styles from "./ChordCard.module.scss";

interface ChordCardProps {
  chord: Chord;
  // Toutes optionnelles : sans elles, la carte reste l'usage lecture seule
  // d'origine (grille de l'étape 3), inchangé.
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const ChordCard = ({ chord, selected = false, onSelect, onDelete }: ChordCardProps) => {
  const isInteractive = onSelect !== undefined;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    // Empêche la désélection globale (tap "en dehors des cartes") de se
    // déclencher pour le tap qui vient justement de sélectionner une carte.
    event.stopPropagation();
    onSelect();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  const className = `${styles.ChordCard} ${isInteractive ? styles.interactive : ""} ${selected ? styles.selected : ""}`.trim();

  return (
    <div
      className={className}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <span className={styles.root}>{rootLabel(chord.root)}</span>
      <span className={styles.quality}>{qualityLabel(chord.quality)}</span>
      {selected && onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          aria-label="Supprimer l’accord"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <IoCloseCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default ChordCard;
