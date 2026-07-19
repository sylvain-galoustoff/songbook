// Validation locale d'un fichier de piste avant upload (wizard d'import,
// cf. CLAUDE.md « Format & stockage audio »). Aucun appel réseau : décodage
// et hachage sont entièrement locaux.

// Tolérance de durée entre pistes d'un même morceau, en échantillons :
// au-delà, l'écart signale presque toujours un export FLAC incohérent plutôt
// qu'un silence de fin de piste légitime. La synchro de lecture elle-même ne
// dépend pas de cette tolérance (elle se fait sur l'index maître du
// worklet, cf. .claude/rules/audio-engine.md) ; c'est un garde-fou côté
// import. ~0,5 s à 44100 Hz.
export const DURATION_TOLERANCE_SAMPLES = 22050;

export interface TrackReference {
  sampleRate: number;
  durationSamples: number;
}

export interface ValidatedTrackMetadata {
  sampleRate: number;
  durationSamples: number;
  channels: number;
  sizeBytes: number;
  contentHash: string;
}

export type TrackRejectionReason =
  | { type: "sampleRateMismatch"; expected: number; actual: number }
  | {
      type: "durationMismatch";
      toleranceSamples: number;
      deviationSamples: number;
    }
  | { type: "unreadableFile"; cause: unknown };

export type TrackValidationResult =
  | { ok: true; metadata: ValidatedTrackMetadata }
  | { ok: false; reason: TrackRejectionReason };

async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// `reference` est la fréquence/durée de la première piste déjà importée pour
// le morceau en cours (null pour cette toute première piste, qui définit
// alors la référence sans être elle-même validée contre quoi que ce soit).
export async function validateTrackFile(
  file: Blob,
  reference: TrackReference | null,
): Promise<TrackValidationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const sizeBytes = arrayBuffer.byteLength;
  // Hacher AVANT de décoder : decodeAudioData détache l'ArrayBuffer transmis,
  // alors que crypto.subtle.digest se contente de le lire.
  const contentHash = await hashArrayBuffer(arrayBuffer);

  const context = new AudioContext();
  try {
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await context.decodeAudioData(arrayBuffer);
    } catch (cause) {
      return { ok: false, reason: { type: "unreadableFile", cause } };
    }

    const sampleRate = audioBuffer.sampleRate;
    const durationSamples = audioBuffer.length;
    const channels = audioBuffer.numberOfChannels;

    if (reference !== null && sampleRate !== reference.sampleRate) {
      return {
        ok: false,
        reason: {
          type: "sampleRateMismatch",
          expected: reference.sampleRate,
          actual: sampleRate,
        },
      };
    }

    if (reference !== null) {
      const deviationSamples = Math.abs(
        durationSamples - reference.durationSamples,
      );
      if (deviationSamples > DURATION_TOLERANCE_SAMPLES) {
        return {
          ok: false,
          reason: {
            type: "durationMismatch",
            toleranceSamples: DURATION_TOLERANCE_SAMPLES,
            deviationSamples,
          },
        };
      }
    }

    return {
      ok: true,
      metadata: { sampleRate, durationSamples, channels, sizeBytes, contentHash },
    };
  } finally {
    // Libération immédiate de l'AudioContext temporaire (et, en cessant de
    // référencer audioBuffer au-delà de cette fonction, du buffer Float32
    // qu'il contenait) : le wizard enchaîne jusqu'à 8 fichiers, et laisser
    // ces ressources s'accumuler reproduirait à l'import le pic mémoire que
    // .claude/rules/audio-engine.md interdit au chargement.
    void context.close();
  }
}
