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
  mutedTracks: Record<string, boolean>;
  onToggleMute: (id: string) => void;
}

export const InstrumentGrid = ({ tracks, mutedTracks, onToggleMute }: InstrumentGridProps) => {
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
        const muted = mutedTracks[track.id] ?? false;
        const cellClassName = muted ? `${styles.cell} ${styles.muted}` : styles.cell;
        return (
          <button
            key={track.id}
            type="button"
            className={cellClassName}
            aria-label={muted ? `Réactiver la piste ${track.instrument}` : `Couper la piste ${track.instrument}`}
            aria-pressed={muted}
            onClick={() => onToggleMute(track.id)}
          >
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
