import { useMemo, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import type { SongRecord } from "../../firebase/songs";
import type { Chord, ChordSection } from "../../types/chord";
import { useChordsAutosave } from "../../hooks/useChordsAutosave";
import { Button } from "../../components/Button/Button";
import { SectionBlock } from "./SectionBlock";
import { AddSectionForm } from "./AddSectionForm";
import { ChordComposer } from "./ChordComposer";
import chordsViewStyles from "./ChordsView.module.scss";
import songStyles from "./Song.module.scss";

interface ChordsViewProps {
  song: SongRecord;
}

// Clé d'identité React locale, jamais persistée (le modèle `ChordSection` de
// l'étape 1 reste { name, chords }, sans id) : permet de cibler une partie de
// façon stable (rename/delete/activation) malgré les insertions/suppressions.
interface SectionEntry {
  key: string;
  section: ChordSection;
}

function toEntries(sections: ChordSection[]): SectionEntry[] {
  return sections.map((section) => ({ key: crypto.randomUUID(), section }));
}

// Identifie l'accord sélectionné par (clé de partie, index dans cette
// partie) — pas par une identité propre à l'accord, qui n'existe pas dans le
// modèle (docs/chords-feature.md §7).
interface SelectedChord {
  sectionKey: string;
  chordIndex: number;
}

export const ChordsView = ({ song }: ChordsViewProps) => {
  const [entries, setEntries] = useState<SectionEntry[]>(() => toEntries(song.chords?.sections ?? []));
  // Partie active par défaut : la DERNIÈRE (docs/chords-feature.md §6).
  const [activeKey, setActiveKey] = useState<string | null>(() =>
    entries.length > 0 ? entries[entries.length - 1].key : null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [selectedChord, setSelectedChord] = useState<SelectedChord | null>(null);

  const sections = useMemo(() => entries.map((entry) => entry.section), [entries]);
  const { status: saveStatus, retry } = useChordsAutosave(song.id, sections);

  const handleAddSection = (name: string) => {
    const key = crypto.randomUUID();
    setEntries((current) => [...current, { key, section: { name, chords: [] } }]);
    setActiveKey(key);
    setIsAdding(false);
  };

  const handleRenameSection = (key: string, name: string) => {
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, section: { ...entry.section, name } } : entry)),
    );
  };

  const handleDeleteSection = (key: string) => {
    const entry = entries.find((item) => item.key === key);
    if (!entry) return;
    if (
      entry.section.chords.length > 0 &&
      !window.confirm(`Supprimer la partie « ${entry.section.name} » et ses accords ?`)
    ) {
      return;
    }
    const remaining = entries.filter((item) => item.key !== key);
    setEntries(remaining);
    // Si la partie active est celle qu'on supprime, on retombe sur la
    // DERNIÈRE restante (jamais null tant qu'il reste une partie) : le
    // compositeur, permanent dès qu'une partie existe, a toujours une cible.
    setActiveKey((current) => {
      if (current !== key) return current;
      return remaining.length > 0 ? remaining[remaining.length - 1].key : null;
    });
    // Une sélection pointant vers la partie supprimée n'a plus de cible.
    setSelectedChord((current) => (current?.sectionKey === key ? null : current));
  };

  // Le compositeur pose toujours dans la partie ACTIVE (docs/chords-feature.md §5).
  const handleAddChord = (chord: Chord) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.key === activeKey
          ? { ...entry, section: { ...entry.section, chords: [...entry.section.chords, chord] } }
          : entry,
      ),
    );
  };

  // Retire l'accord du tableau `chords` de sa partie, même chemin `entries`
  // -> autosave que handleAddChord (docs/chords-feature.md §7) : aucun
  // second chemin d'écriture. Pas de confirmation (geste léger, ré-posable).
  const handleDeleteChord = (sectionKey: string, chordIndex: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.key === sectionKey
          ? { ...entry, section: { ...entry.section, chords: entry.section.chords.filter((_, i) => i !== chordIndex) } }
          : entry,
      ),
    );
    setSelectedChord(null);
  };

  const activeEntry = entries.find((entry) => entry.key === activeKey) ?? null;
  const showEmptyState = entries.length === 0 && !isAdding;

  return (
    <div className={chordsViewStyles.ChordsView} onClick={() => setSelectedChord(null)}>
      {showEmptyState && (
        <div className={songStyles.emptyState}>
          <p className={songStyles.notice}>Ajoute une partie pour commencer</p>
          <Button icon={<IoAddCircleOutline size={24} />} onClick={() => setIsAdding(true)}>
            Ajouter une partie
          </Button>
        </div>
      )}
      {!showEmptyState && (
        <div className={chordsViewStyles.sections}>
          {entries.map((entry) => (
            <SectionBlock
              key={entry.key}
              section={entry.section}
              isActive={entry.key === activeKey}
              onActivate={() => setActiveKey(entry.key)}
              onRename={(name) => handleRenameSection(entry.key, name)}
              onDelete={() => handleDeleteSection(entry.key)}
              selectedChordIndex={selectedChord?.sectionKey === entry.key ? selectedChord.chordIndex : null}
              onSelectChord={(index) => setSelectedChord({ sectionKey: entry.key, chordIndex: index })}
              onDeleteChord={(index) => handleDeleteChord(entry.key, index)}
            />
          ))}
          {isAdding ? (
            <AddSectionForm onSubmit={handleAddSection} onCancel={() => setIsAdding(false)} />
          ) : (
            <Button variant="secondary" icon={<IoAddCircleOutline size={24} />} onClick={() => setIsAdding(true)}>
              Ajouter une partie
            </Button>
          )}
        </div>
      )}
      {saveStatus === "error" && (
        <p className={chordsViewStyles.saveError}>
          Échec de l’enregistrement.{" "}
          <button type="button" className={chordsViewStyles.retryButton} onClick={retry}>
            Réessayer
          </button>
        </p>
      )}
      {/* Permanent dès qu'une partie existe (docs/chords-feature.md §5), même
          pendant la création d'une nouvelle partie (isAdding). */}
      {activeEntry && <ChordComposer activeSectionName={activeEntry.section.name} onAddChord={handleAddChord} />}
    </div>
  );
};

export default ChordsView;
