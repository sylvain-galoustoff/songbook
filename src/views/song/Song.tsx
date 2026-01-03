import { IoAddCircle } from "react-icons/io5";
import CommentsOverlay from "../../components/CommentsOverlay/CommentsOverlay";
import styles from "./Song.module.css";
import { useEffect, useState } from "react";
import type { SongType } from "../../types/Songs";
import Version from "../../components/Version/Version";
import type { VersionType } from "../../types/Version";
import CommentMarker from "../../components/CommentMarker/CommentMarker";
import {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useParams } from "react-router";
import { useAudio } from "../../context/AudioContext";
import { db } from "../../firebase";
import { useComments } from "../../context/CommentsContext";
import { AnimatePresence } from "motion/react";
import AddVersionModal from "./AddVersionModal";
import DeleteVersionModal from "./DeleteVersionModal";

export default function Song() {
  const [song, setSong] = useState<SongType | undefined>();
  const [versions, setVersions] = useState<VersionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentMarkers, setCommentMarkers] = useState<number[]>([]);
  const [markerActive, setMarkerActive] = useState<number | undefined>(
    undefined
  );
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState("");

  const { id } = useParams<{ id: string }>();
  const { versionId, seekTo, setTrackTitle } = useAudio();
  const { commentsTime, setCommentsTime } = useComments();

  const showMarkerComments = (index: number, timecode: number) => {
    setMarkerActive(index);
    setCommentsTime(timecode);
    seekTo(timecode);
  };

  useEffect(() => {
    if (!id) return;

    let unsubscribeVersions: () => void;

    const fetchSongAndListenVersions = async () => {
      try {
        /**
         * 1. Chargement de la chanson (one-shot)
         */
        const songRef = doc(db, "songs", id);
        const songSnap = await getDoc(songRef);

        if (!songSnap.exists()) {
          console.warn("Chanson introuvable");
          return;
        }

        setSong({
          id: songSnap.id,
          ...(songSnap.data() as Omit<SongType, "id">),
        });

        setTrackTitle(songSnap.data().title);

        /**
         * 2. Écoute temps réel des versions
         */
        const versionsQuery = query(
          collection(db, "songs", id, "versions"),
          orderBy("version", "desc")
        );

        unsubscribeVersions = onSnapshot(versionsQuery, (snapshot) => {
          const versionsData: VersionType[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<VersionType, "id">),
          }));

          setVersions(versionsData);
          setLoading(false);
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement de la chanson ou des versions :",
          error
        );
        setLoading(false);
      }
    };

    fetchSongAndListenVersions();

    /**
     * Cleanup obligatoire
     */
    return () => {
      if (unsubscribeVersions) unsubscribeVersions();
    };
  }, [id]);

  useEffect(() => {
    if (!id || !versionId) return;

    const commentsRef = collection(
      db,
      "songs",
      id,
      "versions",
      versionId,
      "comments"
    );

    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const timecodes = snapshot.docs
        .map((doc) => doc.data().timecode)
        .filter((t): t is number => typeof t === "number");

      // Supprime les doublons + tri
      const uniqueSorted = Array.from(new Set(timecodes)).sort((a, b) => a - b);

      setCommentMarkers(uniqueSorted);
    });

    return () => unsubscribe();
  }, [id, versionId]);

  const renderVersions = versions.map((version) => (
    <Version
      key={version.id}
      versionId={version.id}
      versionNumber={version.version}
      date={version.createdAt}
      fileUrl={version.fileUrl}
      deleteVersionId={(id) => setDeleteVersionId(id)}
    />
  ));

  const renderMarker = commentMarkers.map((marker, index) => (
    <CommentMarker
      key={marker}
      timecode={marker}
      index={index}
      isActive={markerActive === index && true}
      setMarkerActive={showMarkerComments}
    />
  ));

  return (
    <div className={`page ${styles.songPage}`} id="song">
      <main className={styles.main}>
        {loading && <p>Chargement…</p>}

        {!loading && song && (
          <div className={styles.versionsWrapper}>
            <div className={styles.version}>
              <div className={styles.header}>
                <h2>Pistes audio</h2>
                <IoAddCircle
                  className={styles.addIcon}
                  onClick={() => setShowAddSongModal(true)}
                />
              </div>
              <div className={styles.versionsList}>{renderVersions}</div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {commentsTime !== undefined && (
            <CommentsOverlay
              key={commentsTime}
              timecode={commentsTime}
              closeOverlay={() => setCommentsTime(undefined)}
            />
          )}
        </AnimatePresence>
      </main>

      <div className={styles.commentsMarkers}>{renderMarker}</div>

      <AnimatePresence>
        {showAddSongModal && (
          <AddVersionModal closeModal={() => setShowAddSongModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteVersionId.length > 0 && (
          <DeleteVersionModal
            closeModal={() => setDeleteVersionId("")}
            deleteId={deleteVersionId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
