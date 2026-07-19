import { IoArrowBack, IoPower } from "react-icons/io5";
import styles from "./Header.module.scss";

interface HeaderProps {
  title?: string;
  subtitle: string;
  onBack?: () => void;
  onLogout?: () => void;
}

export const Header = ({ title = "SongBook", subtitle, onBack, onLogout }: HeaderProps) => {
  return (
    <header className={styles.Header}>
      {onBack && (
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Retour"
        >
          <IoArrowBack size={24} />
        </button>
      )}
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {onLogout && (
        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          aria-label="Déconnexion"
        >
          <IoPower size={24} />
        </button>
      )}
    </header>
  );
};

export default Header;
