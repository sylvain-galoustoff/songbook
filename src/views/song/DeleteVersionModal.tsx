import Modal from "../../components/Modal/Modal";
import { IoTrash } from "react-icons/io5";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";

interface DeleteVersionModalProps {
  deleteId: string;
  closeModal: () => void;
}

export default function DeleteVersionModal({
  closeModal,
  deleteId,
}: DeleteVersionModalProps) {
  const { id: songId } = useParams();

  const deleteVersion = async () => {
    if (!deleteId || !songId) return;

    try {
      await deleteDoc(doc(db, "songs", songId, "versions", deleteId));

      closeModal();
    } catch (error) {
      console.error("Erreur lors de la suppression de la version :", error);
    }
  };

  return (
    <Modal name={"delteVersionid"} closeModal={closeModal}>
      <div className="box">
        <div className="box-header">Supprimer cette version ?</div>
        <div className="box-content">
          Attention : La suppression est définitive !
        </div>
        <div className="box-footer">
          <button type="button" className="danger" onClick={deleteVersion}>
            <IoTrash />
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
}
