import styles from "./AddSong.module.css";
import Header from "../../components/Header/Header";
import { IoCheckmarkDone } from "react-icons/io5";
import { useEffect, useState } from "react";

interface AddSongForm {
  title: string;
  file?: File;
}

export default function AddSong() {
  const [form, setForm] = useState<AddSongForm>({
    title: "",
    file: undefined,
  });

  useEffect(() => {
    console.log(form.file?.name);
  }, [form.file]);

  const submitSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title === "" || form.file === undefined) {
      alert("Veuillez remplir tous les champs du formulaire.");
      return;
    }
    console.log("Form submitted:", form);
  };

  return (
    <div className={styles.addSong} id="add-song">
      <Header />

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
              accept=".mp3, .wav"
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
              <IoCheckmarkDone /> Valider
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
