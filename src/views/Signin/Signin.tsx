import { Link } from "react-router";
import styles from "./Signin.module.css";

export default function Signin() {
  return (
    <div className={styles.signin} id="Signin">
      Signin page
      <Link to="/login">Login page</Link>
    </div>
  );
}
