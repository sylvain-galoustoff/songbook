import { Link } from "react-router";
import styles from "./SongLine.module.css";
import { IoMusicalNote } from "react-icons/io5";

interface SongLineProps {
  id: string;
  title: string;
}

export default function SongLine({ title, id }: SongLineProps) {
  return (
    <Link to={`/song/${id}`} className={styles.songLine}>
      <div className={styles.icon}>
        <IoMusicalNote />
      </div>
      <div className={styles.title}>{title}</div>
    </Link>
  );
}
