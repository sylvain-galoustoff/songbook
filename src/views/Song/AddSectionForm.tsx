import { useState } from "react";
import type { KeyboardEvent } from "react";
import { TextField } from "../../components/TextField/TextField";
import { Button } from "../../components/Button/Button";
import styles from "./AddSectionForm.module.scss";

// Chips de suggestion (docs/chords-feature.md §6) : pré-remplissent le champ,
// la saisie libre reste toujours possible.
const SECTION_NAME_SUGGESTIONS = ["Intro", "Couplet", "Refrain", "Pont", "Solo", "Outro"];

interface AddSectionFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const AddSectionForm = ({ onSubmit, onCancel }: AddSectionFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.AddSectionForm}>
      <div className={styles.chips}>
        {SECTION_NAME_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className={styles.chip}
            onClick={() => setName(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <TextField
        id="chords-new-section-name"
        label="Nom de la partie"
        value={name}
        placeholder="ex. Couplet 2"
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button disabled={name.trim().length === 0} onClick={handleSubmit}>
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default AddSectionForm;
