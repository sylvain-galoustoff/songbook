import Header from "../../components/Header/Header";
import SongLine from "../../components/SongLine/SongLine";
import styles from "./Home.module.css";
import { IoAddCircle } from "react-icons/io5";

export default function Home() {
  return (
    <div className={styles.home} id="home">
      <Header />

      <main className={styles.main}>
        <SongLine title="Evolution" />
        <SongLine title="C'est maladif" />
        <SongLine title="Les vieillards" />
      </main>

      <footer>
        <button className={`${styles.addSong} secondary`}>
          <IoAddCircle />
          Ajouter un morceau
        </button>
      </footer>
    </div>
  );
}
