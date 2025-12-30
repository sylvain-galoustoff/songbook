import styles from "./Song.module.css";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import Modal from "../../components/Modal/Modal";
import { useState } from "react";
import { useParams } from "react-router";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import Loader from "../../components/Loader/Loader";

interface AddVersion {
  songId?: string;
  file?: File;
}

interface AddVersionModalProps {
  closeModal: () => void;
}

export default function AddVersionModal({ closeModal }: AddVersionModalProps) {
  const [form, setForm] = useState<AddVersion>({
    songId: undefined,
    file: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { id: songId } = useParams();

  const submitVersion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!songId || !form.file) return;
    setIsLoading(true);

    try {
      /**
       * 1. Récupérer le numéro de version suivant
       */
      const versionsRef = collection(db, "songs", songId, "versions");
      const snapshot = await getDocs(versionsRef);
      const nextVersionNumber = snapshot.size + 1;

      /**
       * 2. Upload du fichier dans Firebase Storage
       * chemin : songs/{songId}/v{n}_{filename}
       */
      const storageRef = ref(
        storage,
        `songs/${songId}/v${nextVersionNumber}_${form.file.name}`
      );

      await uploadBytes(storageRef, form.file);
      const fileUrl = await getDownloadURL(storageRef);

      /**
       * 3. Création du document Firestore
       */
      await addDoc(versionsRef, {
        version: nextVersionNumber,
        fileName: form.file.name,
        fileUrl,
        createdAt: serverTimestamp(),
      });

      /**
       * 4. Fermeture de la modal
       */
      setIsLoading(false);
      closeModal();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la version :", error);
    }
  };

  return (
    <Modal key="add-song-modal" name="add-song-modal" closeModal={closeModal}>
      <form className="box" onSubmit={submitVersion}>
        <div className="box-header">Ajouter une version</div>
        <div className="box-content">
          <div className={`form-group button-group ${styles.formGroup}`}>
            <label htmlFor="file" className="button primary">
              Ajouter un fichier audio
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
        </div>
        <div className="box-footer button-group">
          <button type="submit" className="secondary">
            <IoCheckmarkDoneOutline />
            Valider
          </button>
        </div>
      </form>

      {isLoading && <Loader />}
    </Modal>
  );
}
