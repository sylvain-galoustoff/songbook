import type { Song } from "../../types/song";
import { SongCard } from "../SongCard/SongCard";
import styles from "./SongList.module.scss";

interface SongListProps {
  songs: Song[];
}

export const SongList = ({ songs }: SongListProps) => {
  if (songs.length === 0) {
    return (
      <p className={styles.empty}>
        Aucune composition pour l'instant.
        <br />
        Cliquez sur « Ajouter une compo » pour commencer.
      </p>
    );
  }

  return (
    <ul className={styles.SongList}>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </ul>
  );
};

export default SongList;
