import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { type CommentType } from "../types/Comment";

const TIME_WINDOW = 1; // secondes (+ / -)

export function useCommentsAtTime(
  songId: string | undefined,
  versionId: string | undefined,
  currentTime: number
) {
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    if (!songId || !versionId) return;

    const min = currentTime - TIME_WINDOW;
    const max = currentTime + TIME_WINDOW;

    const commentsRef = collection(
      db,
      "songs",
      songId,
      "versions",
      versionId,
      "comments"
    );

    const q = query(
      commentsRef,
      where("timecode", ">=", min),
      where("timecode", "<=", max),
      orderBy("timecode", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CommentType, "id">),
      }));

      setComments(data);
    });

    return () => unsubscribe();
  }, [songId, versionId, currentTime]);

  return comments;
}
