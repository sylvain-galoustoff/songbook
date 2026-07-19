import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoArrowForward } from "react-icons/io5";
import { auth } from "../../../firebase/config";
import { Header } from "../../../components/Header/Header";
import { Button } from "../../../components/Button/Button";
import { useNewSongWizard } from "../../../hooks/useNewSongWizard";
import { INSTRUMENTS } from "../../../types/instrument";
import styles from "./SelectInstrument.module.scss";

const SelectInstrument = () => {
  const navigate = useNavigate();
  const { songTitle, trackInstrument, setTrackInstrument } = useNewSongWizard();

  return (
    <div className={styles.SelectInstrument}>
      <Header
        title={songTitle}
        subtitle="Instrument correspondant"
        onBack={() => navigate(-1)}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <p className={styles.label}>Quel instrument est joué sur la piste ?</p>
            <ul className={styles.list}>
              {INSTRUMENTS.map((instrument) => {
                const selected = instrument.id === trackInstrument;

                return (
                  <li key={instrument.id}>
                    <button
                      type="button"
                      className={`${styles.instrument} ${selected ? styles.selected : ""}`}
                      onClick={() => setTrackInstrument(instrument.id)}
                      aria-pressed={selected}
                    >
                      <span className={styles.icon}>
                        <img src={`/instruments/${instrument.id}.svg`} alt="" />
                      </span>
                      <span className={styles.instrumentLabel}>{instrument.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <Button
          variant="primary"
          trailingIcon
          icon={<IoArrowForward size={24} />}
          disabled={!trackInstrument}
        >
          Suite
        </Button>
      </div>
    </div>
  );
};

export default SelectInstrument;
