import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoCheckbox, IoSquareOutline } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import styles from "./SongAction.module.scss";

// Deux actions choisissables cette session (cf. docs/lyrics-feature.md §3) ;
// "accords" reste parqué, hors périmètre.
type SongActionChoice = "audio" | "lyrics";

const ACTION_ROUTES: Record<SongActionChoice, string> = {
  audio: "/new-song/track-mode",
  lyrics: "/new-song/lyrics-text",
};

const SongAction = () => {
  const navigate = useNavigate();
  const { songTitle } = useNewSongWizard();
  // Défaut "audio" : préserve le comportement d'avant cette session pour qui
  // ne touche pas au sélecteur et enchaîne directement sur "Suite".
  const [action, setAction] = useState<SongActionChoice>("audio");

  return (
    <div className={styles.SongAction}>
      <Header
        title={songTitle}
        subtitle="Faites votre choix"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <p className={styles.label}>Que voulez-vous faire ?</p>
            <ul className={styles.list}>
              <li>
                <button
                  type="button"
                  className={`${styles.option} ${action === "audio" ? styles.selected : ""}`}
                  onClick={() => setAction("audio")}
                  aria-pressed={action === "audio"}
                >
                  {action === "audio" ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
                  <span className={styles.optionLabel}>Envoyer de l’audio</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.option} ${action === "lyrics" ? styles.selected : ""}`}
                  onClick={() => setAction("lyrics")}
                  aria-pressed={action === "lyrics"}
                >
                  {action === "lyrics" ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
                  <span className={styles.optionLabel}>Enregistrer les paroles</span>
                </button>
              </li>
              <li>
                <div
                  className={`${styles.option} ${styles.disabled}`}
                  aria-disabled="true"
                  title="Bientôt disponible"
                >
                  <IoSquareOutline size={24} />
                  <span className={styles.optionLabel}>Enregistrer les accords</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          onClick={() => navigate(ACTION_ROUTES[action])}
        >
          Suite
        </Button>
      </div>
    </div>
  );
};

export default SongAction;
