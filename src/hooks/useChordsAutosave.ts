import { useCallback, useEffect, useRef, useState } from "react";
import { updateSong } from "../firebase/songs";
import type { ChordSection } from "../types/chord";

export type ChordsSaveStatus = "idle" | "saving" | "error";

// Rafale de mutations rapprochées (créer/renommer/supprimer une partie)
// coalescées en un seul write Firestore (docs/chords-feature.md §8) : chaque
// changement de `sections` relance ce délai, un seul `updateSong` part une
// fois les mutations calmées.
const AUTOSAVE_DELAY_MS = 600;

export function useChordsAutosave(songId: string, sections: ChordSection[]) {
  const [status, setStatus] = useState<ChordsSaveStatus>("idle");
  const isFirstRender = useRef(true);

  const save = useCallback(
    (toSave: ChordSection[]) => {
      setStatus("saving");
      updateSong(songId, { chords: { sections: toSave } })
        .then(() => setStatus("idle"))
        .catch(() => setStatus("error"));
    },
    [songId],
  );

  useEffect(() => {
    // Au montage, `sections` reflète exactement ce qui vient d'être lu
    // depuis Firestore (cf. ChordsView) : un write ici serait un no-op.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => save(sections), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [sections, save]);

  // Réutilise le dernier `sections` connu : si l'utilisateur a continué à
  // éditer depuis l'échec, c'est cette version à jour qui est retentée.
  const retry = useCallback(() => save(sections), [sections, save]);

  return { status, retry };
}
