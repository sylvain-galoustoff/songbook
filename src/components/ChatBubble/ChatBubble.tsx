import { IoThumbsDownSharp, IoThumbsUpSharp } from "react-icons/io5";
import styles from "./ChatBubble.module.css";
import type { CommentType } from "../../types/Comment";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";
import { useAudio } from "../../context/AudioContext";

interface ChatBubbleProps {
  comment: CommentType;
}

export default function ChatBubble({ comment }: ChatBubbleProps) {
  const { user } = useAuth();
  const { id: songId } = useParams();
  const { versionId } = useAudio();

  if (!songId || !versionId || !user) return null;

  const like = async () => {
    if (!user || !songId || !versionId) return;

    const voteRef = doc(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments",
      comment.id,
      "votes",
      user.uid
    );

    const commentRef = doc(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments",
      comment.id
    );

    try {
      await runTransaction(db, async (tx) => {
        const voteSnap = await tx.get(voteRef);

        // Aucun vote → like
        if (!voteSnap.exists()) {
          tx.set(voteRef, { value: 1, createdAt: serverTimestamp() });
          tx.update(commentRef, { likesCount: increment(1) });
          return;
        }

        const previous = voteSnap.data().value;

        // 👎 → 👍
        if (previous === -1) {
          tx.update(voteRef, { value: 1 });
          tx.update(commentRef, {
            dislikesCount: increment(-1),
            likesCount: increment(1),
          });
          return;
        }

        // 👍 → annulation
        if (previous === 1) {
          tx.delete(voteRef);
          tx.update(commentRef, {
            likesCount: increment(-1),
          });
        }
      });
    } catch (error) {
      console.error("Erreur lors du like :", error);
    }
  };

  const dislike = async () => {
    if (!user || !songId || !versionId) return;

    const voteRef = doc(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments",
      comment.id,
      "votes",
      user.uid
    );

    const commentRef = doc(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments",
      comment.id
    );

    try {
      await runTransaction(db, async (tx) => {
        const voteSnap = await tx.get(voteRef);

        // Aucun vote → dislike
        if (!voteSnap.exists()) {
          tx.set(voteRef, { value: -1, createdAt: serverTimestamp() });
          tx.update(commentRef, { dislikesCount: increment(1) });
          return;
        }

        const previous = voteSnap.data().value;

        // 👍 → 👎
        if (previous === 1) {
          tx.update(voteRef, { value: -1 });
          tx.update(commentRef, {
            likesCount: increment(-1),
            dislikesCount: increment(1),
          });
          return;
        }

        // 👎 → annulation
        if (previous === -1) {
          tx.delete(voteRef);
          tx.update(commentRef, {
            dislikesCount: increment(-1),
          });
        }
      });
    } catch (error) {
      console.error("Erreur lors du dislike :", error);
    }
  };

  return (
    <div
      className={`${styles.wrapper} ${
        user?.uid === comment.uid ? styles.me : styles.notMe
      }`}
    >
      <div className={styles.chatBubble}>
        <div className={styles.header}>{comment.userName}</div>
        <div className={styles.message}>{comment.message}</div>
        <div className={styles.likesWrapper}>
          <div className={`${styles.likeIcon}`} onClick={dislike}>
            <IoThumbsDownSharp
              className={`${styles.thumb} ${
                comment.myVote === -1 ? styles.dislikeActive : undefined
              }`}
            />
          </div>
          <div className={`${styles.likeIcon}`} onClick={like}>
            <IoThumbsUpSharp
              className={`${styles.thumb} ${
                comment.myVote === 1 ? styles.likeActive : undefined
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
