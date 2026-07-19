import styles from "./Header.module.scss";

interface HeaderProps {
  title?: string;
  subtitle: string;
}

export const Header = ({ title = "SongBook", subtitle }: HeaderProps) => {
  return (
    <header className={styles.Header}>
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
};

export default Header;
