import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5";
import type { LyricLine } from "../../firebase/songs";
import styles from "./LyricsPrompter.module.scss";

interface LyricsPrompterProps {
  lines: LyricLine[];
}

type FontSize = "sm" | "md" | "lg";

const FONT_SIZES: FontSize[] = ["sm", "md", "lg"];
const FONT_SIZE_LABELS: Record<FontSize, string> = { sm: "S", md: "M", lg: "L" };
const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: styles.fontSm,
  md: styles.fontMd,
  lg: styles.fontLg,
};

// Rythme de lecture (lignes/minute), pas des px/s bruts (cf.
// docs/lyrics-feature.md §5) : point de départ arbitraire, à ajuster à l'usage.
const DEFAULT_RATE = 20;
const MIN_RATE = 8;
const MAX_RATE = 40;

// Fallback si la mesure DOM échoue (élément pas encore monté) : purement une
// valeur de secours pour amorcer le calcul, jamais affichée telle quelle.
const FALLBACK_LINE_HEIGHT_PX = 24;

const DEFAULT_FONT_SIZE: FontSize = "sm";
const FONT_SIZE_STORAGE_KEY = "lyrics.fontSize";
const RATE_STORAGE_KEY = "lyrics.rate";

function isFontSize(value: string): value is FontSize {
  return value === "sm" || value === "md" || value === "lg";
}

function readStoredFontSize(): FontSize {
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (stored !== null && isFontSize(stored)) return stored;
  } catch {
    // localStorage indisponible (navigation privée, quota…) : défaut silencieux.
  }
  return DEFAULT_FONT_SIZE;
}

function readStoredRate(): number {
  try {
    const stored = localStorage.getItem(RATE_STORAGE_KEY);
    const parsed = stored !== null ? Number(stored) : NaN;
    if (!Number.isNaN(parsed) && parsed >= MIN_RATE && parsed <= MAX_RATE) return parsed;
  } catch {
    // idem
  }
  return DEFAULT_RATE;
}

export const LyricsPrompter = ({ lines }: LyricsPrompterProps) => {
  const [fontSize, setFontSize] = useState<FontSize>(readStoredFontSize);
  const [rate, setRate] = useState<number>(readStoredRate);
  const [isPlaying, setIsPlaying] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  // Offset de défilement accumulé (px) : un ref, pas un state — la boucle
  // rAF écrit directement le style DOM à 60 fps sans jamais déclencher de
  // re-render React (cf. point de vigilance perf).
  const scrollOffsetRef = useRef(0);
  const pxPerSecondRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
    } catch {
      // Rien à faire : préférence non persistée, le rendu continue.
    }
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(RATE_STORAGE_KEY, String(rate));
    } catch {
      // idem
    }
  }, [rate]);

  // hauteurDeLigne mesurée sur un span témoin plutôt que recalculée depuis le
  // token rem : évite de dupliquer en JS une valeur que la CSS possède déjà
  // (police, line-height…), et reste correct si la CSS change.
  useLayoutEffect(() => {
    const measured = measureRef.current ? parseFloat(getComputedStyle(measureRef.current).lineHeight) : NaN;
    const lineHeightPx = Number.isNaN(measured) ? FALLBACK_LINE_HEIGHT_PX : measured;
    // pxParSeconde = rythmeDeLecture/60 * hauteurDeLigne (docs/lyrics-feature.md §5).
    pxPerSecondRef.current = (rate / 60) * lineHeightPx;
  }, [rate, fontSize]);

  // Boucle rAF démarrée/arrêtée avec isPlaying (pas seulement mise en pause
  // logique) : elle ne tourne QUE pendant un défilement actif, sur un
  // composant déjà monté uniquement quand l'onglet Lyrics est actif (Song.tsx).
  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;
    let lastTime: number | null = null;

    const tick = (now: number) => {
      if (lastTime !== null) {
        const elapsedSeconds = (now - lastTime) / 1000;
        scrollOffsetRef.current += elapsedSeconds * pxPerSecondRef.current;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(-${scrollOffsetRef.current}px)`;
        }
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  return (
    <div className={styles.LyricsPrompter}>
      <div className={styles.viewport}>
        <div ref={trackRef} className={`${styles.track} ${FONT_SIZE_CLASS[fontSize]}`}>
          {lines.map((line, index) => (
            <div key={index} className={styles.line}>
              {line.text === "" ? " " : line.text}
            </div>
          ))}
        </div>
      </div>
      {/* Témoin invisible : mesure la hauteur de ligne réelle pour la taille
          de police courante, sans jamais l'écrire en dur en JS. */}
      <span ref={measureRef} className={`${styles.measure} ${FONT_SIZE_CLASS[fontSize]}`} aria-hidden="true">
        Hg
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.playButton}
          onClick={() => setIsPlaying((playing) => !playing)}
          aria-label={isPlaying ? "Mettre le défilement en pause" : "Démarrer le défilement"}
        >
          {isPlaying ? <IoPause size={28} /> : <IoPlay size={28} />}
        </button>
        <input
          type="range"
          className={styles.rateSlider}
          min={MIN_RATE}
          max={MAX_RATE}
          value={rate}
          onChange={(event) => setRate(Number(event.target.value))}
          aria-label="Rythme de défilement (lignes par minute)"
        />
        <div className={styles.fontSizeControl} role="group" aria-label="Taille du texte">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={size === fontSize ? `${styles.fontSizeButton} ${styles.active}` : styles.fontSizeButton}
              aria-pressed={size === fontSize}
              onClick={() => setFontSize(size)}
            >
              {FONT_SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LyricsPrompter;
