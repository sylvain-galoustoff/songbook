import { Link, useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import styles from "./Login.module.css";
import { IoCheckmarkDone } from "react-icons/io5";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (error: any) {
      switch (error.code) {
        case "auth/user-not-found":
          alert("Utilisateur non trouvé.");
          break;
        case "auth/wrong-password":
          alert("Mot de passe incorrect.");
          break;
        case "auth/invalid-email":
          alert("Email invalide.");
          break;
        default:
          alert("Erreur lors de la connexion.");
          console.error(error);
      }
    }
  };

  return (
    <div className={styles.login} id="login">
      <Header />

      <main className={styles.main}>
        <div className={`toast ${styles.toast}`}>
          <p>
            Pas encore inscrit ? <Link to="/signin">Inscrivez-vous</Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={login}>
          <div className="form-group">
            <label htmlFor="email">Votre email</label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Votre mot de passe</label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group button-group">
            <button className="secondary" type="submit">
              <IoCheckmarkDone /> Valider
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
