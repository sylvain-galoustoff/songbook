import type { CSSProperties } from "react";
import type { InstrumentId } from "../../types/instrument";
import styles from "./InstrumentGrid.module.scss";

type GlyphStyle = CSSProperties & { "--icon-src": string };

// Maquette Figma (node 17:597) : 6 emplacements fixes. Sera remplacé par les
// pistes réelles du morceau quand le câblage sera fait.
const PLACEHOLDER_INSTRUMENTS: InstrumentId[] = [
  "drums",
  "bass",
  "guitar",
  "keyboard",
  "vocals",
  "vocals",
];

export const InstrumentGrid = () => {
  return (
    <div className={styles.InstrumentGrid}>
      {PLACEHOLDER_INSTRUMENTS.map((instrumentId, index) => {
        const glyphStyle: GlyphStyle = { "--icon-src": `url(/instruments/${instrumentId}.svg)` };
        return (
          <button key={index} type="button" className={styles.cell}>
            <span className={styles.glyph} style={glyphStyle} />
          </button>
        );
      })}
    </div>
  );
};

export default InstrumentGrid;
