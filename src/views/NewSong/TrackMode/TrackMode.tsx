import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoCheckbox, IoSquareOutline } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import type { TrackModeChoice } from "../../../types/track";
import styles from "./TrackMode.module.scss";

const TrackMode = () => {
  const navigate = useNavigate();
  const { songTitle, trackMode, setTrackMode } = useNewSongWizard();
  const [mode, setMode] = useState<TrackModeChoice>(trackMode ?? "single");

  return (
    <div className={styles.TrackMode}>
      <Header
        title={songTitle}
        subtitle="Mode de pistes"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <p className={styles.label}>Voulez-vous configurer le morceau en multi-piste ?</p>
            <ul className={styles.list}>
              <li>
                <button
                  type="button"
                  className={`${styles.option} ${mode === "single" ? styles.selected : ""}`}
                  onClick={() => setMode("single")}
                  aria-pressed={mode === "single"}
                >
                  {mode === "single" ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
                  <span className={styles.optionLabel}>Non, je n’ai qu’une simple piste</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.option} ${mode === "multi" ? styles.selected : ""}`}
                  onClick={() => setMode("multi")}
                  aria-pressed={mode === "multi"}
                >
                  {mode === "multi" ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
                  <span className={styles.optionLabel}>Oui, je veux configurer plusieurs pistes</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          onClick={() => {
            setTrackMode(mode);
            navigate("/new-song/select-track");
          }}
        >
          Choisir le fichier
        </Button>
      </div>
    </div>
  );
};

export default TrackMode;
