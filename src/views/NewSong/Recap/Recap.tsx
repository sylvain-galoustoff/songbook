import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward, IoCheckbox, IoCheckmark, IoSquareOutline } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { InstrumentIcon } from "../../../components/InstrumentIcon/InstrumentIcon";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import { INSTRUMENTS } from "../../../types/instrument";
import { getNextSongOrder, type TrackMeta } from "../../../firebase/songs";
import {
  abortSongImport,
  finalizeSongImport,
  startSongImport,
  uploadImportTrack,
} from "../../../firebase/songImport";
import styles from "./Recap.module.scss";

const Recap = () => {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { songTitle, tracks } = useNewSongWizard();
  const [wantsMoreTracks, setWantsMoreTracks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!user || tracks.length === 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    let songId: string | null = null;
    try {
      const order = await getNextSongOrder();
      songId = await startSongImport({ title: songTitle, order, createdBy: user.uid });

      const trackMetas: TrackMeta[] = [];

      for (const [index, track] of tracks.entries()) {
        const trackMeta = await uploadImportTrack(songId, {
          id: crypto.randomUUID(),
          instrument: track.instrument,
          order: index,
          file: track.file,
          ...track.metadata,
        });
        trackMetas.push(trackMeta);
      }

      await finalizeSongImport(songId, trackMetas);
      navigate("/");
    } catch {
      if (songId) {
        await abortSongImport(songId).catch(() => {});
      }
      setError("Une erreur est survenue pendant l'enregistrement du morceau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.Recap}>
      <Header
        title={songTitle}
        subtitle="Finalisation"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.recap}>
          <p className={styles.label}>Récap :</p>
          <ul className={styles.recapList}>
            {tracks.map((track, index) => {
              const instrument = INSTRUMENTS.find((item) => item.id === track.instrument);

              return (
                <li key={`${track.instrument}-${index}`} className={styles.recapLine}>
                  <div className={styles.recapInstrument}>
                    <InstrumentIcon instrumentId={track.instrument} />
                    <span className={styles.instrumentLabel}>{instrument?.label}</span>
                  </div>
                  <p className={styles.fileName}>Fichier : {track.file.name}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.moreTracks}>
          <p className={styles.label}>Ajouter d’autres pistes ?</p>
          <div className={styles.radioList}>
            <button
              type="button"
              className={`${styles.radioRow} ${!wantsMoreTracks ? styles.selected : ""}`}
              onClick={() => setWantsMoreTracks(false)}
              aria-pressed={!wantsMoreTracks}
            >
              {!wantsMoreTracks ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
              <span>Non, j’ai terminé</span>
            </button>
            <button
              type="button"
              className={`${styles.radioRow} ${wantsMoreTracks ? styles.selected : ""}`}
              onClick={() => setWantsMoreTracks(true)}
              aria-pressed={wantsMoreTracks}
            >
              {wantsMoreTracks ? <IoCheckbox size={24} /> : <IoSquareOutline size={24} />}
              <span>Oui, je veux configurer d’autres pistes</span>
            </button>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {wantsMoreTracks ? (
          <Button
            variant="primary"
            trailingIcon
            icon={<IoArrowForward size={24} />}
            onClick={() => navigate("/new-song/select-track")}
          >
            Ajouter une piste
          </Button>
        ) : (
          <Button
            variant="primary"
            trailingIcon
            icon={<IoCheckmark size={24} />}
            disabled={submitting || tracks.length === 0}
            onClick={handleFinish}
          >
            {submitting ? "Enregistrement…" : "Terminer"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Recap;
