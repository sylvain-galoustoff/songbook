import Header from "../../components/Header/Header";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.home} id="home">
      <Header />
    </div>
  );
}
