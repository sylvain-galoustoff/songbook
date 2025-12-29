import styles from "./AddSong.module.css";
import { IoCheckmarkDone } from "react-icons/io5";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../../firebase";
import Loader from "../../components/Loader/Loader";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";

interface AddSongForm {
  title: string;
  file?: File;
}

export default function AddSong() {
  const [form, setForm] = useState<AddSongForm>({
    title: "",
    file: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitSong = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.file) {
      alert("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    setIsLoading(true);

    try {
      /**
       * 1. Création de la chanson
       */
      const songRef = await addDoc(collection(db, "songs"), {
        title: form.title,
        createdAt: serverTimestamp(),
        lastVersion: 1,
      });

      /**
       * 2. Upload du fichier audio (version 1)
       */
      const storageRef = ref(
        storage,
        `songs/${songRef.id}/v1_${form.file.name}`
      );

      const snapshot = await uploadBytes(storageRef, form.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      /**
       * 3. Création de la version 1
       */
      await addDoc(collection(db, "songs", songRef.id, "versions"), {
        version: 1,
        fileName: form.file.name,
        fileUrl: downloadURL,
        createdAt: serverTimestamp(),
      });

      /**
       * 4. Redirection
       */
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de l'ajout du morceau :", error);
      alert("Une erreur est survenue lors de l'envoi du fichier.");
    } finally {
      setIsLoading(false);
      setForm({ title: "", file: undefined });
    }
  };

  return (
    <div className={styles.addSong} id="add-song">
      <div className={styles.main}>
        <form className={styles.form} onSubmit={submitSong}>
          <div className={`form-group ${styles.formGroup}`}>
            <label htmlFor="title">Titre du morceau</label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className={`form-group button-group ${styles.formGroup}`}>
            <label htmlFor="file" className="button primary">
              Ajouter un fichier .mp3 ou .wav
            </label>

            {form.file && <p className={styles.fileInfo}>{form.file.name}</p>}

            <input
              type="file"
              id="file"
              accept=".mp3,.wav"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm({ ...form, file });
                }
              }}
            />
          </div>

          <footer className={styles.footer}>
            <button type="submit" className="button secondary">
              <IoCheckmarkDone />
              Valider
            </button>
          </footer>
        </form>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader message="Envoi en cours" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
