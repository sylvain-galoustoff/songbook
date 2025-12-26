import styles from "./Header.module.css";
import { IoArrowBack, IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

interface HeaderProps {
  title?: string;
  backArrow?: boolean;
}

export default function Header({ title, backArrow = false }: HeaderProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.icon}>
        {backArrow ? (
          <IoArrowBack onClick={() => navigate(-1)} />
        ) : (
          <IoMusicalNotes />
        )}
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
