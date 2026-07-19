import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../../components/Header/Header";
import { getSong } from "../../firebase/songs";
import { InstrumentGrid } from "./InstrumentGrid";
import { AudioControls } from "./AudioControls";
import { Tabbar } from "./Tabbar";
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
      <Header title={headerTitle} badge="Version 4" onBack={() => navigate("/")} />
      <div className={styles.body}>
        <InstrumentGrid />
        <AudioControls />
      </div>
      <Tabbar />
    </div>
  );
};

export default Song;
