import styles from "./Header.module.css";
import { IoArrowBack, IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";

export default function Header() {
  const [backArrow, setBackArrow] = useState(false);
  const [title, setTitle] = useState("");
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location);

  if (location.pathname === "/song")
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
