import { Link } from "react-router";
import styles from "./Login.module.css";

export default function Login() {
  return (
    <div className={styles.login} id="login">
      Login page
      <Link to="/signin">Signin page</Link>
    </div>
  );
}
