import { Link } from "react-router";
import styles from "./Login.module.css";

export default function Login() {
  return (
    <div className="page" id="login">
      Login page
      <Link to="/signin">Signin page</Link>
    </div>
  );
}
