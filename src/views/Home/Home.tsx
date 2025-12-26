import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import SongLine from "../../components/SongLine/SongLine";
import styles from "./Home.module.css";
import { IoAddCircle } from "react-icons/io5";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import type { Song } from "../../types/Songs";
import NoSongsFound from "../../components/NoSongsFound/NoSongsFound";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);

      try {
        const q = query(collection(db, "songs"), orderBy("title", "asc"));

        const snapshot = await getDocs(q);

        const songsData: Song[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Song, "id">),
        }));

        setSongs(songsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur chargement songs :", error);
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const renderSongsLines = songs.map((song) => (
    <SongLine key={song.id} title={song.title} id={song.id} />
  ));

  return (
    <div className={styles.home} id="home">
      <Header title="Vos chansons" />

      {isLoading === false && (
        <main className={styles.main}>
          {songs.length > 0 ? renderSongsLines : <NoSongsFound />}
        </main>
      )}

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
