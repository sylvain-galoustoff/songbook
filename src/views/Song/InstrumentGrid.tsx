import type { CSSProperties } from "react";
import type { TrackSource } from "../../audio/audioEngine";
import styles from "./InstrumentGrid.module.scss";

type GlyphStyle = CSSProperties & { "--icon-src": string };
type GridStyle = CSSProperties & { "--grid-rows": number };

const COLUMNS = 3;
// Jusqu'à 15 pistes (cf. besoin produit) = 5 rangées de 3 pour la grille.
const MAX_ROWS = 5;

interface InstrumentGridProps {
  tracks: TrackSource[];
}

export const InstrumentGrid = ({ tracks }: InstrumentGridProps) => {
  const rows = Math.min(MAX_ROWS, Math.max(1, Math.ceil(tracks.length / COLUMNS)));
  // Cases vides pour compléter la dernière rangée : sans icône, non
  // cliquables (juste un remplissage visuel, cf. la grille "morceau" de la
  // maquette Figma).
  const placeholderCount = Math.max(0, rows * COLUMNS - tracks.length);
  const gridStyle: GridStyle = { "--grid-rows": rows };

  return (
    <div className={styles.InstrumentGrid} style={gridStyle}>
      {tracks.map((track) => {
        const glyphStyle: GlyphStyle = { "--icon-src": `url(/instruments/${track.instrument}.svg)` };
        return (
          <button key={track.id} type="button" className={styles.cell} aria-label={track.instrument}>
            <span className={styles.glyph} style={glyphStyle} />
          </button>
        );
      })}
      {Array.from({ length: placeholderCount }, (_, index) => (
        <div key={`placeholder-${index}`} className={styles.placeholder} aria-hidden="true" />
      ))}
    </div>
  );
};

export default InstrumentGrid;
