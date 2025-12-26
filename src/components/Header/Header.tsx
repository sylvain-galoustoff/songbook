import styles from "./Header.module.css";
import { IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { logout, user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.icon}>
        <IoMusicalNotes />
      </div>

      <div className={styles.headerText}>
        <h1 className={styles.pageTitle}>Songbook</h1>
        <p className={styles.title}>{title}</p>
      </div>

      {user && (
        <div className={styles.logOut} onClick={logout} title="Déconnexion">
          <IoPower />
        </div>
      )}
    </header>
  );
}
