import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../../components/Header/Header";
import { getSong, type SongRecord, type TrackMeta } from "../../firebase/songs";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import { InstrumentGrid } from "./InstrumentGrid";
import { AudioControls } from "./AudioControls";
import { Tabbar } from "./Tabbar";
import styles from "./Song.module.scss";

// Référence stable : évite de redéclencher le chargement audio à chaque
// render tant qu'aucun morceau jouable n'est encore connu (cf. useAudioEngine).
const EMPTY_TRACKS: TrackMeta[] = [];

const Song = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getSong(id)
      .then((record) => {
        if (!cancelled) setSong(record);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Un morceau "draft" ou sans piste n'est pas jouable (cf. CLAUDE.md
  // « Format & stockage audio »).
  const playableSong = song && song.status === "ready" && song.tracks.length > 0 ? song : null;
  const player = useAudioEngine(playableSong?.id ?? null, playableSong?.tracks ?? EMPTY_TRACKS);

  const headerTitle = loading ? "Chargement…" : (song?.title ?? "Morceau introuvable");
  const progress = player.duration > 0 ? player.position / player.duration : 0;
  const controlsDisabled = player.status !== "ready";

  return (
    <div className={styles.Song}>
      <Header title={headerTitle} onBack={() => navigate("/")} />
      <div className={styles.body}>
        {!loading && !playableSong && (
          <p className={styles.notice}>
            {song ? "Ce morceau n’est pas encore disponible." : "Morceau introuvable."}
          </p>
        )}
        {playableSong && (
          <>
            <InstrumentGrid tracks={player.tracks} />
            {player.status === "error" && player.loadError && (
              <p className={styles.notice}>{player.loadError}</p>
            )}
            <AudioControls
              isPlaying={player.isPlaying}
              disabled={controlsDisabled}
              progress={progress}
              onTogglePlay={player.togglePlayPause}
            />
          </>
        )}
      </div>
      <Tabbar />
    </div>
  );
};

export default Song;
