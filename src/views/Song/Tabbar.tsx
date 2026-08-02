import { IoText, IoVolumeMedium, IoMusicalNotes } from "react-icons/io5";
import styles from "./Tabbar.module.scss";

export type SongTab = "lyrics" | "musique" | "accords";

interface TabbarProps {
  activeTab: SongTab;
  onTabChange: (tab: SongTab) => void;
}

function tabClassName(isActive: boolean): string {
  return isActive ? `${styles.tab} ${styles.active}` : styles.tab;
}

export const Tabbar = ({ activeTab, onTabChange }: TabbarProps) => {
  return (
    <nav className={styles.Tabbar}>
      <button
        type="button"
        className={tabClassName(activeTab === "lyrics")}
        onClick={() => onTabChange("lyrics")}
      >
        <IoText size={24} />
        <span className={styles.label}>Lyrics</span>
      </button>
      <button
        type="button"
        className={tabClassName(activeTab === "musique")}
        onClick={() => onTabChange("musique")}
      >
        <IoVolumeMedium size={24} />
        <span className={styles.label}>Musique</span>
      </button>
      {/* Accords parqué (docs/lyrics-feature.md §10) : inerte cette session,
          ni actif ni navigable. */}
      <button type="button" className={styles.tab} disabled>
        <IoMusicalNotes size={24} />
        <span className={styles.label}>Accords</span>
      </button>
    </nav>
  );
};

export default Tabbar;
