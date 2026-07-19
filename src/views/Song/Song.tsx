import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Header } from "../../components/Header/Header";
import { Loader } from "../../components/Loader/Loader";
import { getSong, type SongRecord, type TrackMeta } from "../../firebase/songs";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import { useRotatingMessage } from "../../hooks/useRotatingMessage";
import { InstrumentGrid } from "./InstrumentGrid";
import { AudioControls } from "./AudioControls";
import { Tabbar } from "./Tabbar";
import styles from "./Song.module.scss";

// Référence stable : évite de redéclencher le chargement audio à chaque
// render tant qu'aucun morceau jouable n'est encore connu (cf. useAudioEngine).
const EMPTY_TRACKS: TrackMeta[] = [];

// Le fun (ces messages) et le réel (la barre de progression, cf. plus bas)
// sont volontairement découplés : les messages tournent sur une simple
// horloge de 3 s, la progression affichée vient, elle, exclusivement de
// useAudioEngine (nombre de pistes effectivement reçues).
const MESSAGE_INTERVAL_MS = 3000;

const SONG_FLAVORS = [
  "On retrouve la partition…",
  "On fouille les archives du groupe…",
  "On dépoussière la setlist…",
] as const;

const FETCH_FLAVORS = [
  "On branche les amplis…",
  "On déroule les câbles…",
  "On règle les micros…",
  "On accorde les guitares…",
] as const;

const DECODE_FLAVORS = [
  "Dernier réglage de la balance…",
  "On chauffe la sono…",
  "Presque prêt à jouer…",
] as const;

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
  const audioLoading = player.status === "idle" || player.status === "loading";
  const decoding = player.loadProgress?.phase === "decoding";

  const songMessage = useRotatingMessage(SONG_FLAVORS, MESSAGE_INTERVAL_MS, loading);
  const fetchMessage = useRotatingMessage(
    FETCH_FLAVORS,
    MESSAGE_INTERVAL_MS,
    audioLoading && !decoding,
  );
  const decodeMessage = useRotatingMessage(DECODE_FLAVORS, MESSAGE_INTERVAL_MS, decoding);

  const fetchProgress =
    player.loadProgress?.phase === "fetching" && player.loadProgress.total > 0
      ? player.loadProgress.loaded / player.loadProgress.total
      : 0;

  return (
    <div className={styles.Song}>
      <Header title={headerTitle} onBack={() => navigate("/")} />
      <div className={styles.body}>
        {loading && <Loader message={songMessage} />}
        {!loading && !song && <p className={styles.notice}>Morceau introuvable.</p>}
        {!loading && song && !playableSong && (
          <p className={styles.notice}>Ce morceau n’est pas encore disponible.</p>
        )}
        {playableSong && player.status === "error" && (
          <p className={styles.notice}>{player.loadError}</p>
        )}
        {playableSong && audioLoading && !decoding && (
          <Loader message={fetchMessage} progress={fetchProgress} />
        )}
        {playableSong && audioLoading && decoding && <Loader message={decodeMessage} />}
        {playableSong && player.status === "ready" && (
          <>
            <InstrumentGrid tracks={player.tracks} />
            <AudioControls
              isPlaying={player.isPlaying}
              disabled={false}
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
