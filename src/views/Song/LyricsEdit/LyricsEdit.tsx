import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Loader } from "../../../components/Loader/Loader";
import { LyricsPasteForm } from "../../../components/LyricsPasteForm/LyricsPasteForm";
import {
  getSong,
  hasLyrics,
  joinLinesToBlock,
  updateSong,
  type LyricLine,
  type SongRecord,
} from "../../../firebase/songs";
import styles from "./LyricsEdit.module.scss";

const UNSAVED_CHANGES_MESSAGE =
  "Des modifications non enregistrées seront perdues. Quitter quand même ?";

// Action « paroles » sur un morceau EXISTANT (docs/lyrics-feature.md §3,
// « action paroles — édition fusionnée ») : contrairement à LyricsText.tsx
// (morceau neuf, un seul write draft→ready), ici le morceau est déjà
// "ready" — un simple patch du champ lyrics, sans jamais y toucher.
const LyricsEdit = () => {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [song, setSong] = useState<SongRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Bloc de référence pour la garde « modifications non enregistrées » :
  // figé une fois le morceau chargé (jamais réécrit ensuite), comparé au
  // texte courant remonté par LyricsPasteForm via onTextChange.
  const [initialBlock, setInitialBlock] = useState("");
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (!songId) return;

    let cancelled = false;

    getSong(songId)
      .then((record) => {
        if (cancelled) return;
        setSong(record);
        const block = record && hasLyrics(record) && record.lyrics ? joinLinesToBlock(record.lyrics.lines) : "";
        setInitialBlock(block);
        setCurrentText(block);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [songId]);

  const handleBack = () => {
    if (currentText !== initialBlock && !window.confirm(UNSAVED_CHANGES_MESSAGE)) {
      return;
    }
    navigate(-1);
  };

  // Contrat gravé (docs/lyrics-feature.md §3) : succès → retour au
  // prompteur, onglet Lyrics ; échec → LyricsPasteForm rattrape l'erreur,
  // reste sur la page et conserve le texte saisi (rien à faire ici).
  const handleSubmit = async (lines: LyricLine[]) => {
    if (!songId) throw new Error("Identifiant de morceau manquant.");
    await updateSong(songId, { lyrics: { lines } });
    navigate(`/song/${songId}`, { state: { initialTab: "lyrics" } });
  };

  return (
    <div className={styles.LyricsEdit}>
      <Header
        title={song?.title ?? "Paroles"}
        subtitle="Édition des paroles"
        onBack={handleBack}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        {loading && <Loader message="Chargement des paroles…" />}
        {!loading && !song && <p className={styles.notice}>Morceau introuvable.</p>}
        {!loading && song && (
          <LyricsPasteForm
            key={song.id}
            submitLabel="Enregistrer"
            submittingLabel="Enregistrement…"
            initialText={initialBlock}
            onTextChange={setCurrentText}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default LyricsEdit;
