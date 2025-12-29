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
  getDocs,
} from "firebase/firestore";
import { useParams } from "react-router";
import { useAudio } from "../../context/AudioContext";
import { db } from "../../firebase";
import { fetchCommentTimecodes } from "../../utils/fetchCommentTimecodes";

export default function Song() {
  const [song, setSong] = useState<SongType | undefined>();
  const [versions, setVersions] = useState<VersionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsTime, setCommentsTime] = useState<number | undefined>(
    undefined
  );
  const [commentMarkers, setCommentMarkers] = useState<number[]>([]);
  const [markerActive, setMarkerActive] = useState<number | undefined>(
    undefined
  );

  const { id } = useParams<{ id: string }>();
  const { versionId, seekTo, setTrackTitle } = useAudio();

  const showMarkerComments = (index: number, timecode: number) => {
    setMarkerActive(index);
    setCommentsTime(timecode);
    seekTo(timecode);
  };

  useEffect(() => {
    if (!id) return;

    const fetchSongAndVersions = async () => {
      try {
        /**
         * 1. Chargement de la chanson
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
         * 2. Chargement des versions
         */
        const versionsQuery = query(
          collection(db, "songs", id, "versions"),
          orderBy("version", "desc")
        );

        const versionsSnap = await getDocs(versionsQuery);

        const versionsData: VersionType[] = versionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<VersionType, "id">),
        }));

        setVersions(versionsData);
      } catch (error) {
        console.error(
          "Erreur lors du chargement de la chanson ou des versions :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSongAndVersions();
  }, [id]);

  useEffect(() => {
    if (!id || versionId === undefined) return;

    const loadMarkers = async () => {
      const timecodes = await fetchCommentTimecodes(id, versionId);
      setCommentMarkers(timecodes);
    };

    loadMarkers();
  }, [id, versions, versionId]);

  const renderVersions = versions.map((version) => (
    <Version
      key={version.id}
      versionId={version.id}
      versionNumber={version.version}
      date={version.createdAt}
      fileUrl={version.fileUrl}
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
          <>
            <div className={styles.version}>
              <div className={styles.header}>
                <h2>Pistes audio</h2>
                <IoAddCircle className={styles.addIcon} />
              </div>
              <div className={styles.versionsList}>{renderVersions}</div>
            </div>
          </>
        )}

        {commentsTime !== undefined && (
          <CommentsOverlay
            timecode={commentsTime}
            closeOverlay={() => setCommentsTime(undefined)}
          />
        )}
      </main>

      <div className={styles.commentsMarkers}>{renderMarker}</div>
    </div>
  );
}
