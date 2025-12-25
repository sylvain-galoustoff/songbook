import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import SongLine from "../../components/SongLine/SongLine";
import styles from "./Home.module.css";
import { IoAddCircle } from "react-icons/io5";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import type { Song } from "../../types/Songs";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const q = query(collection(db, "songs"), orderBy("title", "asc"));

        const snapshot = await getDocs(q);

        const songsData: Song[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Song, "id">),
        }));

        setSongs(songsData);
      } catch (error) {
        console.error("Erreur chargement songs :", error);
      }
    };

    fetchSongs();
  }, []);

  const renderSongsLines = songs.map((song) => (
    <SongLine key={song.id} title={song.title} />
  ));

  return (
    <div className={styles.home} id="home">
      <Header />

      {/*
      TODO: 
        Afficher "Aucun morceau disponible" si la liste des morceaux est vide
        Rendre SongLine cliquable pour naviguer vers la page de détails du morceau
      */}
      <main className={styles.main}>{renderSongsLines}</main>

      <footer>
        <button
          type="button"
          className={`${styles.addSong} secondary`}
          onClick={() => navigate("/add-song")}
        >
          <IoAddCircle />
          Ajouter un morceau
        </button>
      </footer>
    </div>
  );
}
