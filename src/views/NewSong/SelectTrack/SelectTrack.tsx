import { useRef, useState, type ChangeEvent } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoFolder } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import { validateTrackFile, type TrackRejectionReason } from "../../../audio/trackValidation";
import styles from "./SelectTrack.module.scss";

function describeRejection(reason: TrackRejectionReason, fileName: string): string {
  switch (reason.type) {
    case "sampleRateMismatch":
      return `Fichier "${fileName}" refusé : sa fréquence d'échantillonnage (${reason.actual} Hz) diffère de celle du morceau (${reason.expected} Hz).`;
    case "durationMismatch":
      return `Fichier "${fileName}" refusé : sa durée diffère trop des autres pistes déjà ajoutées.`;
    case "unreadableFile":
      return `Fichier "${fileName}" refusé : fichier audio illisible.`;
  }
}

const SelectTrack = () => {
  const navigate = useNavigate();
  const { songTitle, trackFile, setTrackFile, setTrackFileMetadata, tracks } = useNewSongWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setError(null);
    setTrackFile(null);
    setTrackFileMetadata(null);

    if (!file) {
      return;
    }

    setValidating(true);
    const reference = tracks[0]?.metadata ?? null;
    const result = await validateTrackFile(file, reference);
    setValidating(false);

    if (!result.ok) {
      setError(describeRejection(result.reason, file.name));
      return;
    }

    setTrackFile(file);
    setTrackFileMetadata(result.metadata);
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
              disabled={validating}
            >
              {validating
                ? "Vérification…"
                : trackFile
                  ? trackFile.name
                  : "Parcourir les fichiers"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".flac,audio/flac"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          disabled={!trackFile || validating}
          onClick={() => navigate("/new-song/select-instrument")}
        >
          Attribuer l’instrument
        </Button>
      </div>
    </div>
  );
};

export default SelectTrack;
