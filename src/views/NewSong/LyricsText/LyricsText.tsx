import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../../../firebase/config";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { Header } from "../../../components/Header/Header";
import { LyricsPasteForm } from "../../../components/LyricsPasteForm/LyricsPasteForm";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import { createReadySongWithLyrics, getNextSongOrder, type LyricLine } from "../../../firebase/songs";
import styles from "./LyricsText.module.scss";

const LyricsText = () => {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { songTitle } = useNewSongWizard();

  // Écriture unique (docs/lyrics-feature.md §3) : le morceau naît directement
  // en "ready", jamais de draft intermédiaire — contrairement au flux audio
  // (startSongImport → uploadImportTrack → finalizeSongImport).
  const handleSubmit = async (lines: LyricLine[]) => {
    if (!user) throw new Error("Utilisateur non authentifié.");

    const order = await getNextSongOrder();
    await createReadySongWithLyrics({
      title: songTitle,
      order,
      createdBy: user.uid,
      lyrics: { lines },
    });
    navigate("/");
  };

  return (
    <div className={styles.LyricsText}>
      <Header
        title={songTitle}
        subtitle="Paroles"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <LyricsPasteForm submitLabel="Enregistrer" submittingLabel="Enregistrement…" onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default LyricsText;
