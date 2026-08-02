import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { IoAddCircleOutline, IoCloudUploadOutline } from "react-icons/io5";
import { Header } from "../../components/Header/Header";
import { Loader } from "../../components/Loader/Loader";
import { Button } from "../../components/Button/Button";
import { getSong, hasLyrics, isPlayable, type SongRecord, type TrackMeta } from "../../firebase/songs";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import { useRotatingMessage } from "../../hooks/useRotatingMessage";
import { InstrumentGrid } from "./InstrumentGrid";
import { AudioControls } from "./AudioControls";
import { LyricsPrompter } from "./LyricsPrompter";
import { ChordsView } from "./ChordsView";
import { Tabbar, type SongTab } from "./Tabbar";
import styles from "./Song.module.scss";

// Référence stable : évite de redéclencher le chargement audio à chaque
// render tant qu'aucun morceau jouable n'est encore connu (cf. useAudioEngine).
const EMPTY_TRACKS: TrackMeta[] = [];

// Le fun (ces messages) et le réel (la barre de progression) sont
// volontairement découplés : les messages tournent sur une simple horloge de
// 3 s, la progression affichée vient, elle, exclusivement de useAudioEngine.
// Une seule instance de <Loader> vit sur toute la séquence de chargement
// (recherche du morceau → téléchargement → décodage) : ne jamais la démonter
// pour changer de message/barre, sous peine de sautillement des éléments
// autour (cf. retour utilisateur) — seuls le message et la valeur de
// progression affichés changent d'une phase à l'autre.
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

// L'onglet par défaut reste TOUJOURS Musique (écran-roi, uniforme, cf.
// docs/lyrics-feature.md §4) — sauf retour explicite depuis la page
// d'édition des paroles (LyricsEdit), qui demande l'onglet Lyrics via
// `location.state` pour que les paroles à jour soient visibles immédiatement.
function initialTabFromLocationState(state: unknown): SongTab {
  if (state && typeof state === "object" && "initialTab" in state) {
    const value = (state as { initialTab?: unknown }).initialTab;
    if (value === "lyrics" || value === "musique" || value === "accords") return value;
  }
  return "musique";
}

const Song = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SongTab>(() => initialTabFromLocationState(location.state));

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
  // « Format & stockage audio », isPlayable dans firebase/songs.ts).
  const playableSong = song && song.status === "ready" && isPlayable(song) ? song : null;
  const player = useAudioEngine(playableSong?.id ?? null, playableSong?.tracks ?? EMPTY_TRACKS);
  // Mode simple piste (cf. CLAUDE.md `trackMode`) : pas de mute possible,
  // donc pas de grille d'instruments — seuls les contrôles de lecture restent.
  const isSingleTrack = playableSong?.trackMode === "single";
  const songHasLyrics = song !== null && hasLyrics(song);

  const headerTitle = loading ? "Chargement…" : (song?.title ?? "Morceau introuvable");
  const progress = player.duration > 0 ? player.position / player.duration : 0;
  // idle/loading ne signale un chargement audio en cours que pour un morceau
  // effectivement playable (sinon useAudioEngine reste "idle" indéfiniment,
  // faute de pistes à charger — cf. useAudioEngine.ts).
  const audioLoading = playableSong !== null && (player.status === "idle" || player.status === "loading");
  const showLoader = loading || audioLoading;

  const fetching = audioLoading && player.loadProgress?.phase === "fetching";
  const loaderFlavors = loading ? SONG_FLAVORS : fetching ? FETCH_FLAVORS : DECODE_FLAVORS;
  const loaderMessage = useRotatingMessage(loaderFlavors, MESSAGE_INTERVAL_MS, showLoader);
  const loaderProgress =
    fetching && player.loadProgress?.phase === "fetching" && player.loadProgress.total > 0
      ? player.loadProgress.loaded / player.loadProgress.total
      : undefined;

  return (
    <div className={styles.Song}>
      <Header title={headerTitle} onBack={() => navigate("/")} />
      <div className={isSingleTrack ? `${styles.body} ${styles.singleTrack}` : styles.body}>
        {loading && <Loader message={loaderMessage} progress={loaderProgress} />}
        {!loading && !song && <p className={styles.notice}>Morceau introuvable.</p>}
        {!loading && song && activeTab === "musique" && (
          <>
            {playableSong ? (
              <>
                {audioLoading && <Loader message={loaderMessage} progress={loaderProgress} />}
                {player.status === "error" && (
                  <p className={styles.notice}>{player.loadError}</p>
                )}
                {player.status === "ready" && (
                  <>
                    {!isSingleTrack && (
                      <InstrumentGrid
                        tracks={player.tracks}
                        mutedTracks={player.mutedTracks}
                        onToggleMute={player.toggleTrackMute}
                      />
                    )}
                    <AudioControls
                      isPlaying={player.isPlaying}
                      disabled={false}
                      progress={progress}
                      durationSamples={player.duration}
                      loop={player.loop}
                      onTogglePlay={player.togglePlayPause}
                      onSeek={(index) => {
                        player.seek(index);
                        player.commitSeek();
                      }}
                      onToggleLoop={player.toggleLoop}
                    />
                  </>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.notice}>Il n’y a pas encore de piste audio</p>
                {/* TODO(session 6, docs/lyrics-feature.md §11) : brancher
                    l'action audio réutilisable sur ce bouton. */}
                <Button icon={<IoCloudUploadOutline size={24} />}>Ajouter de l’audio</Button>
              </div>
            )}
          </>
        )}
        {!loading && song && activeTab === "lyrics" && (
          <>
            {songHasLyrics && song.lyrics ? (
              <LyricsPrompter key={song.id} songId={song.id} lines={song.lyrics.lines} />
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.notice}>Pas de paroles</p>
                <Button icon={<IoAddCircleOutline size={24} />} to={`/song/${song.id}/lyrics/edit`}>
                  Créer les paroles
                </Button>
              </div>
            )}
          </>
        )}
        {!loading && song && activeTab === "accords" && <ChordsView key={song.id} song={song} />}
      </div>
      <Tabbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Song;
