import { useState } from "react";
import Header from "../../components/Header/Header";
import styles from "./Signin.module.css";
import { IoCheckmarkDone } from "react-icons/io5";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router";

export default function Signin() {
  const [form, setForm] = useState({
    pseudo: "",
    email: "",
    password: "",
  });

  function submitSignin(e: React.FormEvent) {
    e.preventDefault();

    if (form.pseudo.trim() === "") {
      alert("Veuillez entrer un pseudo.");
      return;
    }

    createUserWithEmailAndPassword(auth, form.email, form.password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Création du document Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: form.pseudo,
          email: user.email,
          createdAt: serverTimestamp(),
        });

        console.log("Utilisateur créé + document Firestore");

        // Exemple :
        // navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Erreur Firebase :", error.code, error.message);

        switch (error.code) {
          case "auth/email-already-in-use":
            alert("Cet email est déjà utilisé.");
            break;
          case "auth/invalid-email":
            alert("Email invalide.");
            break;
          case "auth/weak-password":
            alert("Mot de passe trop faible (6 caractères minimum).");
            break;
          default:
            alert("Erreur lors de l'inscription.");
        }
      });
  }

  return (
    <div className={styles.signin} id="signin">
      <Header title="Inscription" />
      <main className={styles.main}>
        <div className={`toast ${styles.toast}`}>
          <p>
            Déjà Inscrit ? <Link to="/login">Connectez-vous</Link>
          </p>
        </div>

        <form className={styles.form} onSubmit={submitSignin}>
          <div className="form-group">
            <label htmlFor="pseudo">Votre pseudo</label>
            <input
              type="text"
              id="pseudo"
              value={form.pseudo}
              onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
            />
          </div>
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
