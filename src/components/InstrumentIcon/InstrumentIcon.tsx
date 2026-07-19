import type { CSSProperties } from "react";
import type { InstrumentId } from "../../types/instrument";
import styles from "./InstrumentIcon.module.scss";

type GlyphStyle = CSSProperties & { "--icon-src": string };

interface InstrumentIconProps {
  instrumentId: InstrumentId;
}

// Les icônes sont fournies en `public/instruments/{id}.svg` (cf. CLAUDE.md).
// Rendues en masque CSS plutôt qu'en <img> : un <img> fige la couleur interne
// du SVG, alors que la maquette veut ces glyphes en var(--secondary), piloté
// par le token plutôt que par le fichier.
export const InstrumentIcon = ({ instrumentId }: InstrumentIconProps) => {
  const glyphStyle: GlyphStyle = { "--icon-src": `url(/instruments/${instrumentId}.svg)` };

  return (
    <span className={styles.InstrumentIcon}>
      <span className={styles.glyph} style={glyphStyle} />
    </span>
  );
};

export default InstrumentIcon;
