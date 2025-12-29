import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchCommentTimecodes = async (
  songId: string,
  versionId: string
): Promise<number[]> => {
  const commentsRef = collection(
    db,
    "songs",
    songId,
    "versions",
    versionId,
    "comments"
  );

  const snap = await getDocs(commentsRef);

  const timecodes = snap.docs.map((doc) => doc.data().timecode as number);

  // Déduplication + tri
  return Array.from(new Set(timecodes)).sort((a, b) => a - b);
};
