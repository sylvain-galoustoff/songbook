import { IoCaretForward } from "react-icons/io5";
import { Link } from "react-router";
import type { Song } from "../../types/song";
import styles from "./SongCard.module.scss";

interface SongCardProps {
  song: Song;
}

export const SongCard = ({ song }: SongCardProps) => {
  return (
    <li className={styles.item}>
      <Link to={`/song/${song.id}`} className={styles.SongCard}>
        <p className={styles.title}>{song.title}</p>
        <IoCaretForward className={styles.caret} />
      </Link>
    </li>
  );
};

export default SongCard;
