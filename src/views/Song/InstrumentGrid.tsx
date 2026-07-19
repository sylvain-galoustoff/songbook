import type { CSSProperties } from "react";
import type { TrackSource } from "../../audio/audioEngine";
import styles from "./InstrumentGrid.module.scss";

type GlyphStyle = CSSProperties & { "--icon-src": string };

interface InstrumentGridProps {
  tracks: TrackSource[];
}

export const InstrumentGrid = ({ tracks }: InstrumentGridProps) => {
  return (
    <div className={styles.InstrumentGrid}>
      {tracks.map((track) => {
        const glyphStyle: GlyphStyle = { "--icon-src": `url(/instruments/${track.instrument}.svg)` };
        return (
          <button key={track.id} type="button" className={styles.cell} aria-label={track.instrument}>
            <span className={styles.glyph} style={glyphStyle} />
          </button>
        );
      })}
    </div>
  );
};

export default InstrumentGrid;
