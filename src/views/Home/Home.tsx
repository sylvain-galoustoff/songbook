import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { Button } from "../../components/Button/Button";
import styles from "./Home.module.scss";

const Home = () => {
  return (
    <div className={styles.Home}>
      <p>Home</p>
      <Button variant="secondary" onClick={() => signOut(auth)}>
        Déconnexion
      </Button>
    </div>
  );
};

export default Home;
