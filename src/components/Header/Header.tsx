import styles from "./Header.module.css";
import { IoArrowBack, IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [backArrow, setBackArrow] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location);

  return (
    <header className={styles.header}>
      <div className={styles.icon}>
        {backArrow && <IoArrowBack onClick={() => navigate(-1)} />}
      </div>

      <div className={styles.headerText}>
        <h1 className={styles.pageTitle}>
          <IoMusicalNotes />
          Songbook
        </h1>
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
