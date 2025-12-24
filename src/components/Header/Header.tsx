import { useLocation } from "react-router";
import styles from "./Header.module.css";
import { IoMusicalNotes } from "react-icons/io5";

export default function Header() {
  const location = useLocation();

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
    </header>
  );
}
