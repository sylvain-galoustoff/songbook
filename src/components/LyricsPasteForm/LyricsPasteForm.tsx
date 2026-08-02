import { useState } from "react";
import { Button } from "../Button/Button";
import { hasLyricsContent, linesFromBlock, type LyricLine } from "../../firebase/songs";
import styles from "./LyricsPasteForm.module.scss";

interface LyricsPasteFormProps {
  submitLabel: string;
  submittingLabel: string;
  // Reçoit les lignes déjà découpées (cf. linesFromBlock) ; à charge de
  // l'appelant de choisir l'écriture Firestore (création vs mise à jour,
  // cf. docs/lyrics-feature.md §3).
  onSubmit: (lines: LyricLine[]) => Promise<void>;
}

const EMPTY_LYRICS_ERROR = "Ajoutez au moins une ligne de paroles.";
const SAVE_ERROR = "Une erreur est survenue pendant l'enregistrement des paroles.";

export const LyricsPasteForm = ({ submitLabel, submittingLabel, onSubmit }: LyricsPasteFormProps) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const lines = linesFromBlock(text);
    if (!hasLyricsContent(lines)) {
      setError(EMPTY_LYRICS_ERROR);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(lines);
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.LyricsPasteForm}>
      <div className={styles.field}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Collez les paroles ici…"
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <Button variant="primary" disabled={submitting} onClick={handleSubmit}>
        {submitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
};

export default LyricsPasteForm;
