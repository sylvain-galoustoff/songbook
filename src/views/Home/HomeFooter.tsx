import { IoAddCircle } from "react-icons/io5";
import styles from "./Home.module.css";
import { useNavigate } from "react-router";

export default function HomeFooter() {
  const navigate = useNavigate();

  return (
    <footer>
      <button
        type="button"
        className={`${styles.addSong} secondary`}
        onClick={() => navigate("/add-song")}
      >
        <IoAddCircle />
        Ajouter un morceau
      </button>
    </footer>
  );
}
