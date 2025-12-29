import styles from "./Loader.module.css";
import { IoMusicalNotes } from "react-icons/io5";

export default function Loader({ message }: { message?: string }) {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>
        <IoMusicalNotes />
        {message ? (
          <p className={styles.message}>{message}</p>
        ) : (
          <p className={styles.message}>Patientez...</p>
        )}
      </div>
    </div>
  );
}
