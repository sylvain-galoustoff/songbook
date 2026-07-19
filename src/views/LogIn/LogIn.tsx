import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { IoCheckmarkDone, IoAddCircle } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { Header } from "../../components/Header/Header";
import { TextField } from "../../components/TextField/TextField";
import { Button } from "../../components/Button/Button";
import styles from "./LogIn.module.scss";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.LogIn}>
      <Header subtitle="Connexion" />
      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Votre email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            id="password"
            label="Votre mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button
            type="submit"
            variant="primary"
            icon={<IoCheckmarkDone size={24} />}
            disabled={submitting}
          >
            Valider
          </Button>
        </form>
        <div className={styles.signUp}>
          <p className={styles.signUpLabel}>Pas de compte ?</p>
          <Button to="/signin" variant="secondary" icon={<IoAddCircle size={24} />}>
            Inscrivez-vous
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
