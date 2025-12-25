import styles from "./SongLine.module.css";
import { IoMusicalNote } from "react-icons/io5";

interface SongLineProps {
  title: string;
}

export default function SongLine({ title }: SongLineProps) {
  return (
    <div className={styles.songLine}>
      <div className={styles.icon}>
        <IoMusicalNote />
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
}
