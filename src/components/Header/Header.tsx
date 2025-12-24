import { useLocation } from "react-router";
import styles from "./Header.module.css";
import { IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const pageParams: Record<string, { title: string }> = {
    "/signin": { title: "Inscription" },
    "/login": { title: "Connexion" },
  };

  return (
    <header className={styles.header}>
      <div className={styles.icon}>
        <IoMusicalNotes />
      </div>

      <div className={styles.headerText}>
        <h1 className={styles.pageTitle}>Songbook</h1>
        <p className={styles.title}>
          {pageParams[location.pathname]?.title || ""}
        </p>
      </div>

      {user && (
        <div className={styles.logOut} onClick={logout} title="Déconnexion">
          <IoPower />
        </div>
      )}
    </header>
  );
}
