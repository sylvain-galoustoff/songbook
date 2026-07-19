import { IoText, IoVolumeMedium, IoMusicalNotes } from "react-icons/io5";
import styles from "./Tabbar.module.scss";

export const Tabbar = () => {
  return (
    <nav className={styles.Tabbar}>
      <button type="button" className={styles.tab}>
        <IoText size={24} />
        <span className={styles.label}>Lyrics</span>
      </button>
      <button type="button" className={`${styles.tab} ${styles.active}`}>
        <IoVolumeMedium size={24} />
        <span className={styles.label}>Musique</span>
      </button>
      <button type="button" className={styles.tab}>
        <IoMusicalNotes size={24} />
        <span className={styles.label}>Accords</span>
      </button>
    </nav>
  );
};

export default Tabbar;
