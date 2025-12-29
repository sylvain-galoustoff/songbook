import { IoCloseCircle, IoSend } from "react-icons/io5";
import { formatMinutesSeconds } from "../../utils/formatTime";
import styles from "./CommentsOverlay.module.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAudio } from "../../context/AudioContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";
import { useCommentsForVersion } from "../../hooks/useCommentsForVersion";
import ChatBubble from "../ChatBubble/ChatBubble";

interface CommentsOverlayProps {
  timecode: number;
  closeOverlay: () => void;
}

export default function CommentsOverlay({
  timecode,
  closeOverlay,
}: CommentsOverlayProps) {
  const [message, setMessage] = useState("");
  const { user, profile } = useAuth();
  const { versionId } = useAudio();
  const { id: songId } = useParams<{ id: string }>();

  const { comments } = useCommentsForVersion({
    songId,
    versionId,
  });

  const filteredComments = comments.filter(
    (c) => Math.abs(c.timecode - timecode) <= 1
  );

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !songId || !versionId || message.trim() === "") return;

    try {
      const commentsRef = collection(
        db,
        "songs",
        songId,
        "versions",
        versionId,
        "comments"
      );

      await addDoc(commentsRef, {
        uid: user.uid,
        userName: profile?.name ?? "Anonyme",
        message: message.trim(),
        timecode,
        createdAt: serverTimestamp(),
        likesCount: 0,
        dislikesCount: 0,
      });

      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du commentaire :", error);
    }
  };

  return (
    <div className={styles.commentsOverlay}>
      <header className={`toast ${styles.commentsToast}`}>
        <h2>Commentaires à {formatMinutesSeconds(timecode)}</h2>
        <IoCloseCircle className={styles.closeButton} onClick={closeOverlay} />
      </header>

      <div className={styles.body}>
        <div className={styles.commentsList}>
          {filteredComments.map((comment) => (
            <ChatBubble key={comment.id} comment={comment} />
          ))}
        </div>

        <form className={styles.addComment} onSubmit={submitMessage}>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Ajouter un commentaire…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className={styles.sendIconWrapper} onClick={submitMessage}>
            <IoSend className={styles.sendIcon} />
          </div>
        </form>
      </div>
    </div>
  );
}
