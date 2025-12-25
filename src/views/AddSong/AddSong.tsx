import styles from "./AddSong.module.css";
import Header from "../../components/Header/Header";
import { IoCheckmarkDone } from "react-icons/io5";

export default function AddSong() {
  return (
    <div className={styles.addSong} id="add-song">
      <Header />

      <div className={styles.main}>
        <form className={styles.form}>
          <div className={`form-group ${styles.formGroup}`}>
            <label htmlFor="title">Titre du morceau</label>
            <input type="text" id="title" />
          </div>
          <div className={`form-group button-group ${styles.formGroup}`}>
            <label htmlFor="file" className="button primary">
              Ajouter un fichier .mp3 ou .wav
            </label>
            <input type="file" id="file" />
          </div>
          <footer className={styles.footer}>
            <button type="submit" className="button secondary">
              <IoCheckmarkDone /> Valider
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
