import { signOut } from "firebase/auth";
import { IoAddCircle } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { Button } from "../../components/Button/Button";
import { Header } from "../../components/Header/Header";
import { SongList } from "../../components/SongList/SongList";
import type { Song } from "../../types/song";
import styles from "./Home.module.scss";

const mockSongs: Song[] = [
  { id: "1", title: "Evolution" },
  { id: "2", title: "Maladif" },
  { id: "3", title: "Babylone brûle" },
  { id: "4", title: "Ska Funk" },
  { id: "5", title: "Calme" },
];

const Home = () => {
  const songCount = mockSongs.length;
  const subtitle = `${songCount} ${songCount <= 1 ? "morceau" : "morceaux"}`;

  return (
    <div className={styles.Home}>
      <Header
        title="Vos compositions"
        subtitle={subtitle}
        onLogout={() => signOut(auth)}
      />
      <div className={styles.body}>
        <SongList songs={mockSongs} />
        <Button variant="primary" icon={<IoAddCircle size={24} />}>
          Ajouter une compo
        </Button>
      </div>
    </div>
  );
};

export default Home;
