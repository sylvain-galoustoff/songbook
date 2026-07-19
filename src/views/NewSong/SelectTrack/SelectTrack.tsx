import { useRef, type ChangeEvent } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoFolder } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import styles from "./SelectTrack.module.scss";

const SelectTrack = () => {
  const navigate = useNavigate();
  const { songTitle, trackFile, setTrackFile } = useNewSongWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTrackFile(event.target.files?.[0] ?? null);
  };

  return (
    <div className={styles.SelectTrack}>
      <Header
        title={songTitle}
        subtitle="Envoyez l’audio"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <p className={styles.label}>Choisissez votre piste son</p>
            <Button
              variant="secondary"
              icon={<IoFolder size={24} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {trackFile ? trackFile.name : "Parcourir les fichiers"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".flac,audio/flac"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          disabled={!trackFile}
          onClick={() => navigate("/new-song/select-instrument")}
        >
          Attribuer l’instrument
        </Button>
      </div>
    </div>
  );
};

export default SelectTrack;
