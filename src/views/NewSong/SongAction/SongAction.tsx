import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoCheckbox, IoSquareOutline } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import styles from "./SongAction.module.scss";

const SongAction = () => {
  const navigate = useNavigate();
  const { songTitle } = useNewSongWizard();

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
                <div className={styles.option}>
                  <IoCheckbox size={24} />
                  <span className={styles.optionLabel}>Envoyer de l’audio</span>
                </div>
              </li>
              <li>
                <div
                  className={`${styles.option} ${styles.disabled}`}
                  aria-disabled="true"
                  title="Bientôt disponible"
                >
                  <IoSquareOutline size={24} />
                  <span className={styles.optionLabel}>Enregistrer les paroles</span>
                </div>
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
          onClick={() => navigate("/new-song/track-mode")}
        >
          Suite
        </Button>
      </div>
    </div>
  );
};

export default SongAction;
