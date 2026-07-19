import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router";
import { auth } from "../../firebase/config";
import { Header } from "../../components/Header/Header";
import { getSong } from "../../firebase/songs";
import styles from "./Song.module.scss";

const Song = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getSong(id)
      .then((song) => {
        if (!cancelled) setTitle(song?.title ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const headerTitle = loading ? "Chargement…" : (title ?? "Morceau introuvable");

  return (
    <div className={styles.Song}>
      <Header
        title={headerTitle}
        subtitle=""
        onBack={() => navigate("/")}
        onLogout={() => signOut(auth)}
      />
    </div>
  );
};

export default Song;
