import { query, collection, orderBy, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import NoSongsFound from "../../components/NoSongsFound/NoSongsFound";
import SongLine from "../../components/SongLine/SongLine";
import { db } from "../../firebase";
import type { SongType } from "../../types/Songs";
import styles from "./Home.module.css";

export default function Home() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const renderSongsLines = songs.map((song) => (
    <SongLine key={song.id} title={song.title} id={song.id} />
  ));

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);

      try {
        const q = query(collection(db, "songs"), orderBy("title", "asc"));

        const snapshot = await getDocs(q);

        const songsData: SongType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<SongType, "id">),
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

  return (
    <div className="page" id="home">
      {isLoading === false && (
        <main className={styles.main}>
          {songs.length > 0 ? renderSongsLines : <NoSongsFound />}
        </main>
      )}
    </div>
  );
}
