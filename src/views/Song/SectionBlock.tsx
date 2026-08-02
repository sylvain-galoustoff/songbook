import { useState } from "react";
import type { KeyboardEvent } from "react";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { ChordCard } from "../../components/ChordCard/ChordCard";
import type { ChordSection } from "../../types/chord";
import styles from "./SectionBlock.module.scss";

interface SectionBlockProps {
  section: ChordSection;
  // Bascule d'affichage (cf. ChordsView) : masque le renommage/suppression de
  // partie et retombe les cartes sur leur rendu lecture seule (pas d'onSelect/
  // onDelete transmis à ChordCard).
  readOnly: boolean;
  isActive: boolean;
  // Absents en lecture : activer une partie ou modifier son nom/suppression
  // n'a de sens qu'en édition (cible du compositeur, outils d'édition).
  onActivate?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  // Index de l'accord sélectionné DANS CETTE PARTIE, ou null si la sélection
  // en cours (état porté par ChordsView) est ailleurs ou absente.
  selectedChordIndex: number | null;
  onSelectChord?: (index: number) => void;
  onDeleteChord?: (index: number) => void;
}

export const SectionBlock = ({
  section,
  readOnly,
  isActive,
  onActivate,
  onRename,
  onDelete,
  selectedChordIndex,
  onSelectChord,
  onDeleteChord,
}: SectionBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(section.name);

  const startRename = () => {
    setDraftName(section.name);
    setIsEditing(true);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed.length > 0 && trimmed !== section.name) {
      onRename?.(trimmed);
    }
    setIsEditing(false);
  };

  const cancelRename = () => {
    setDraftName(section.name);
    setIsEditing(false);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") cancelRename();
  };

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate?.();
    }
  };

  const headerClassName = !readOnly && isActive ? `${styles.header} ${styles.active}` : styles.header;

  return (
    <div className={styles.SectionBlock}>
      <div
        className={headerClassName}
        role={readOnly ? undefined : "button"}
        tabIndex={readOnly ? undefined : 0}
        onClick={readOnly ? undefined : onActivate}
        onKeyDown={readOnly ? undefined : handleHeaderKeyDown}
      >
        {isEditing ? (
          <input
            className={styles.nameInput}
            value={draftName}
            autoFocus
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={handleNameKeyDown}
          />
        ) : (
          <p className={styles.name}>{section.name}</p>
        )}
        {!readOnly && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Renommer la partie"
              onClick={(event) => {
                event.stopPropagation();
                startRename();
              }}
            >
              <IoPencilOutline size={20} />
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Supprimer la partie"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.();
              }}
            >
              <IoTrashOutline size={20} />
            </button>
          </div>
        )}
      </div>
      {section.chords.length > 0 && (
        <div className={styles.cards}>
          {section.chords.map((chord, index) => (
            <ChordCard
              key={index}
              chord={chord}
              selected={!readOnly && selectedChordIndex === index}
              onSelect={readOnly ? undefined : () => onSelectChord?.(index)}
              onDelete={readOnly ? undefined : () => onDeleteChord?.(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionBlock;
