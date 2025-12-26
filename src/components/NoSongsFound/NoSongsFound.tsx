import styles from "./NoSongsFound.module.css";
import { IoArrowDown } from "react-icons/io5";

export default function NoSongsFound() {
  return (
    <div className={styles.noSongsFound}>
      <h1 className={styles.noSongsFoundText}>Aucun morceau disponible</h1>
      <p>Ajoute ton premier morceau en cliquant sur le bouton en bas de page</p>
      <div className={styles.icon}>
        <IoArrowDown />
      </div>
    </div>
  );
}
