import styles from "./Header.module.css";
import { IoArrowBack, IoMusicalNotes, IoPower } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";

interface HeaderProps {
  title: string;
  backArrow?: boolean;
}

const titleVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const transition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function Header({ title, backArrow = false }: HeaderProps) {
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
        <AnimatePresence mode="wait">
          <motion.p
            key={title}
            variants={titleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className={styles.title}
          >
            {title}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {user && (
          <motion.div
            key="logoutButton"
            variants={titleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className={styles.logOut}
            onClick={logout}
            title="Déconnexion"
          >
            <IoPower />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
