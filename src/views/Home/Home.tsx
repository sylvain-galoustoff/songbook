import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { IoAddCircle } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { Button } from "../../components/Button/Button";
import { Header } from "../../components/Header/Header";
import { SongList } from "../../components/SongList/SongList";
import { listReadySongs } from "../../firebase/songs";
import type { Song } from "../../types/song";
import styles from "./Home.module.scss";

const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listReadySongs()
      .then((records) => {
        if (cancelled) return;
        setSongs(records.map((record) => ({ id: record.id, title: record.title })));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const songCount = songs.length;
  const subtitle = loading
    ? "Chargement…"
    : `${songCount} ${songCount <= 1 ? "morceau" : "morceaux"}`;

  return (
    <div className={styles.Home}>
      <Header
        title="Vos compositions"
        subtitle={subtitle}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        {error ? (
          <p className={styles.error}>Impossible de charger les morceaux.</p>
        ) : (
          <SongList songs={songs} />
        )}
        <Button variant="primary" icon={<IoAddCircle size={24} />} to="/new-song/song-name">
          Ajouter une compo
        </Button>
      </div>
    </div>
  );
};

export default Home;
