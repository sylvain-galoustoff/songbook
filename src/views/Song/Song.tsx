import Header from "../../components/Header/Header";
import styles from "./Song.module.css";

export default function Song() {
  return (
    <div className={styles.Song} id="Song">
      <Header />

      <main className={styles.main}>Song component</main>
    </div>
  );
}
