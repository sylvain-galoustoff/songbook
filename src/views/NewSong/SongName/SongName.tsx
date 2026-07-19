import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { TextField } from "../../../components/TextField/TextField";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import styles from "./SongName.module.scss";

const SongName = () => {
  const navigate = useNavigate();
  const { songTitle, setSongTitle } = useNewSongWizard();

  return (
    <div className={styles.SongName}>
      <Header
        title="Nouveau morceau"
        subtitle="Donnez un titre à votre compo"
        onBack={() => navigate("/")}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.form}>
          <TextField
            id="song-title"
            label="Quel est le titre du morceau ?"
            placeholder="Titre du morceau"
            value={songTitle}
            onChange={(event) => setSongTitle(event.target.value)}
            required
          />
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          disabled={songTitle.trim() === ""}
        >
          Réglages pistes audio
        </Button>
      </div>
    </div>
  );
};

export default SongName;
