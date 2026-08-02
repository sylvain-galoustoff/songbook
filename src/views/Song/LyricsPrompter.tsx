import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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

// Seuil de déplacement (px) qui départage hold et swipe (docs/lyrics-feature.md
// §5/§7) : un contact qui ne bouge pas plus que ça reste un hold (gel) ; au-delà,
// c'est un swipe (ajustement du rythme). 10px correspond au "touch slop" usuel
// des plateformes tactiles (~8-10px sur iOS/Android) : assez grand pour absorber
// le tremblement naturel d'un doigt posé, assez petit pour rester réactif au
// premier vrai geste de glissement.
const HOLD_MOVE_THRESHOLD_PX = 10;

// Sensibilité du swipe : nombre de pixels de glissement pour 1 unité de rythme
// (lignes/minute). 8px/unité fait parcourir tout le range (32 unités, 8 à 40)
// sur ~256px, une amplitude de glissement confortable à une main sur un
// téléphone, sans être si sensible qu'un petit geste sature immédiatement min/max.
const SWIPE_PX_PER_RATE_UNIT = 8;

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
  // Gel temporaire du défilement (hold) : consulté par la boucle rAF, ne
  // modifie ni isPlaying ni rate — cf. point de vigilance (une seule boucle).
  const isFrozenRef = useRef(false);
  // Désambiguïsation hold/swipe (docs/lyrics-feature.md §5/§7).
  const gesturePointerIdRef = useRef<number | null>(null);
  const gestureModeRef = useRef<"undetermined" | "swipe">("undetermined");
  const gestureStartYRef = useRef(0);
  const gestureLastYRef = useRef(0);

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
        // lastTime avance même gelé : évite un saut d'offset à la reprise
        // (le temps "gelé" n'est simplement jamais converti en pixels).
        if (!isFrozenRef.current) {
          const elapsedSeconds = (now - lastTime) / 1000;
          scrollOffsetRef.current += elapsedSeconds * pxPerSecondRef.current;
          if (trackRef.current) {
            trackRef.current.style.transform = `translateY(-${scrollOffsetRef.current}px)`;
          }
        }
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Un seul contact géré à la fois (ignore un second doigt qui se poserait
  // pendant un geste déjà en cours).
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (gesturePointerIdRef.current !== null) return;
    gesturePointerIdRef.current = event.pointerId;
    gestureModeRef.current = "undetermined";
    gestureStartYRef.current = event.clientY;
    gestureLastYRef.current = event.clientY;
    // Contact posé = hold par défaut, gel immédiat ; requalifié en swipe dans
    // handlePointerMove si le déplacement franchit le seuil.
    isFrozenRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== gesturePointerIdRef.current) return;

    if (gestureModeRef.current === "undetermined") {
      const distanceFromStart = Math.abs(event.clientY - gestureStartYRef.current);
      if (distanceFromStart <= HOLD_MOVE_THRESHOLD_PX) return;
      // Seuil franchi : ce n'est plus un hold, on lève le gel et on bascule en swipe.
      gestureModeRef.current = "swipe";
      isFrozenRef.current = false;
    }

    // Swipe : haut (deltaY < 0) accélère, bas ralentit. Delta incrémental
    // depuis le dernier move, pour un ajustement continu pendant le glissement.
    const deltaY = event.clientY - gestureLastYRef.current;
    gestureLastYRef.current = event.clientY;
    setRate((current) => {
      const next = current - deltaY / SWIPE_PX_PER_RATE_UNIT;
      return Math.round(Math.min(MAX_RATE, Math.max(MIN_RATE, next)));
    });
  };

  // pointerup et pointercancel (interruption) traités identiquement : reprise
  // du défilement (no-op si déjà un swipe, déjà dégelé plus haut).
  const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== gesturePointerIdRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gesturePointerIdRef.current = null;
    gestureModeRef.current = "undetermined";
    isFrozenRef.current = false;
  };

  return (
    <div className={styles.LyricsPrompter}>
      <div
        className={styles.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
      >
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
