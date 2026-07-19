import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router";
import { IoCheckmarkDone, IoAddCircle } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { Header } from "../../components/Header/Header";
import { TextField } from "../../components/TextField/TextField";
import { Button } from "../../components/Button/Button";
import styles from "./Signin.module.scss";

const Signin = () => {
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName: pseudo });
      navigate("/");
    } catch {
      setError("Impossible de créer le compte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.Signin}>
      <Header subtitle="Inscription" />
      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextField
            id="pseudo"
            label="Votre pseudo"
            type="text"
            placeholder="Choisissez un pseudo"
            autoComplete="nickname"
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            required
          />
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
            autoComplete="new-password"
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
        <div className={styles.logIn}>
          <p className={styles.logInLabel}>Déjà inscrit ?</p>
          <Button to="/login" variant="secondary" icon={<IoAddCircle size={24} />}>
            Connectez-vous
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Signin;
