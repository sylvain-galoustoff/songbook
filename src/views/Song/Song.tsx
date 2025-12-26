import { useParams } from "react-router";
import Header from "../../components/Header/Header";
import styles from "./Song.module.css";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { Song } from "../../types/Songs";
import type { VersionType } from "../../types/Version";
import { IoAddCircle } from "react-icons/io5";
import Version from "../../components/Version/Version";
import Player from "../../components/Player/Player";

export default function Song() {
  const [song, setSong] = useState<Song | undefined>();
  const [versions, setVersions] = useState<VersionType[]>([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();

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
          ...(songSnap.data() as Omit<Song, "id">),
        });

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

  const renderVersions = versions.map((version) => (
    <Version
      key={version.id}
      versionNumber={version.version}
      date={version.createdAt}
      fileUrl={version.fileUrl}
    />
  ));

  return (
    <div className={styles.song} id="song">
      <Header title={song?.title} />

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
      </main>

      <footer>
        <Player />
      </footer>
    </div>
  );
}
