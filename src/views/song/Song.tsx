import { IoAddCircle } from "react-icons/io5";
import CommentsOverlay from "../../components/CommentsOverlay/CommentsOverlay";
import styles from "./Song.module.css";
import { useState } from "react";
import type { SongType } from "../../types/Songs";
import Version from "../../components/Version/Version";
import type { VersionType } from "../../types/Version";

export default function Song() {
  const [song, setSong] = useState<SongType | undefined>();
  const [versions, setVersions] = useState<VersionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsTime, setCommentsTime] = useState<number | undefined>(
    undefined
  );

  const renderVersions = versions.map((version) => (
    <Version
      key={version.id}
      versionId={version.id}
      versionNumber={version.version}
      date={version.createdAt}
      fileUrl={version.fileUrl}
    />
  ));

  return (
    <div className="page" id="song">
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
    </div>
  );
}
