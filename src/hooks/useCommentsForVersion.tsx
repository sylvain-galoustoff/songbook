import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import type { CommentType } from "../types/Comment";

interface Params {
  songId?: string;
  versionId?: string;
}

export function useCommentsForVersion({ songId, versionId }: Params) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId || !versionId || !user) return;

    const commentsRef = collection(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments"
    );

    const q = query(commentsRef, orderBy("timecode", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const baseComments: CommentType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CommentType, "id" | "myVote">),
      }));

      // 🔥 récupérer les votes utilisateur
      const commentsWithVotes = await Promise.all(
        baseComments.map(async (comment) => {
          const voteRef = collection(
            db,
            "songs",
            songId,
            "versions",
            versionId,
            "comments",
            comment.id,
            "votes"
          );

          return new Promise<CommentType>((resolve) => {
            onSnapshot(voteRef, (voteSnap) => {
              const myVoteDoc = voteSnap.docs.find((d) => d.id === user.uid);

              resolve({
                ...comment,
                myVote: myVoteDoc
                  ? (myVoteDoc.data().value as -1 | 1)
                  : undefined,
              });
            });
          });
        })
      );

      setComments(commentsWithVotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [songId, versionId, user]);

  return { comments, loading };
}
