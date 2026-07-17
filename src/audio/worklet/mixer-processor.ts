import type {
  MainToWorkletMessage,
  TrackPayload,
  WorkletToMainMessage,
} from "./protocol";

// Types minimaux pour l'API AudioWorklet : absente des libs TS "ES2023"/"DOM"
// utilisées par le reste de l'app (scope global différent du thread principal).
declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
  ): boolean;
}

declare function registerProcessor(
  name: string,
  ctor: new () => AudioWorkletProcessor,
): void;

declare const sampleRate: number;

interface Track {
  id: string;
  channels: Int16Array[];
  length: number;
  gain: number;
  targetGain: number;
  rampIncrement: number;
  rampSamplesRemaining: number;
}

const INT16_TO_FLOAT = 1 / 32768;
// Rampe courte sur les changements de gain (mute/unmute) pour éviter les clics.
const GAIN_RAMP_DURATION_SECONDS = 0.005;
// Fréquence d'émission de la position vers le thread principal (throttlée).
const POSITION_REPORT_INTERVAL_SECONDS = 0.1;

// Index de lecture maître unique = seule source de vérité de la position.
// Toutes les pistes sont lues au même index : la synchro est intrinsèque.
class MixerProcessor extends AudioWorkletProcessor {
  private tracks: Track[] = [];
  private masterIndex = 0;
  private playing = false;
  private lastReportedIndex = 0;
  private loopStart: number | null = null;
  private loopEnd: number | null = null;

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent<MainToWorkletMessage>) => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(message: MainToWorkletMessage): void {
    switch (message.type) {
      case "loadTracks":
        this.tracks = message.tracks.map(toTrack);
        this.masterIndex = 0;
        this.lastReportedIndex = 0;
        this.playing = false;
        this.loopStart = null;
        this.loopEnd = null;
        break;
      case "play":
        this.playing = true;
        break;
      case "pause":
        this.playing = false;
        break;
      case "setTrackGain":
        this.setTrackGain(message.id, message.gain);
        break;
      case "seek":
        this.seek(message.index);
        break;
      case "toggleLoopPoint":
        this.toggleLoopPoint();
        break;
    }
  }

  // seek déplace uniquement l'index maître : toutes les pistes suivent
  // instantanément, toujours alignées (aucune reconstruction de nœud).
  private seek(targetIndex: number): void {
    if (this.tracks.length === 0) return;
    const trackLength = Math.max(...this.tracks.map((track) => track.length));
    this.masterIndex = Math.max(0, Math.min(targetIndex, trackLength - 1));

    // Un seek en dehors d'une boucle active efface A/B et sort du mode boucle.
    if (
      this.loopStart !== null &&
      this.loopEnd !== null &&
      (this.masterIndex < this.loopStart || this.masterIndex > this.loopEnd)
    ) {
      this.loopStart = null;
      this.loopEnd = null;
      this.notifyLoopChange();
    }

    this.reportPosition();
  }

  // Un seul bouton, 3 pressions : rien → A, A → B (boucle active), A+B → rien.
  private toggleLoopPoint(): void {
    if (this.loopStart === null) {
      this.loopStart = this.masterIndex;
      this.notifyLoopChange();
      return;
    }

    if (this.loopEnd === null) {
      if (this.masterIndex <= this.loopStart) {
        // B tomberait derrière (ou sur) la tête de lecture : la boucle serait
        // invalide. On revient immédiatement à A (un seek) sans changer les
        // points : l'utilisateur re-pose B depuis là.
        this.masterIndex = this.loopStart;
        this.reportPosition();
        return;
      }
      this.loopEnd = this.masterIndex;
      this.notifyLoopChange();
      return;
    }

    this.loopStart = null;
    this.loopEnd = null;
    this.notifyLoopChange();
  }

  private notifyLoopChange(): void {
    const message: WorkletToMainMessage = {
      type: "loop",
      start: this.loopStart,
      end: this.loopEnd,
    };
    this.port.postMessage(message);
  }

  private reportPosition(): void {
    this.lastReportedIndex = this.masterIndex;
    const message: WorkletToMainMessage = {
      type: "position",
      index: this.masterIndex,
    };
    this.port.postMessage(message);
  }

  // Le gain est indépendant de la position de lecture : mute/unmute
  // n'interagit pas avec l'état play/pause, et survit naturellement au
  // seek et à la boucle (à venir).
  private setTrackGain(id: string, targetGain: number): void {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return;

    if (!this.playing) {
      // Rien à l'oreille pendant une pause : pas besoin de rampe.
      track.gain = targetGain;
      track.targetGain = targetGain;
      track.rampIncrement = 0;
      track.rampSamplesRemaining = 0;
      return;
    }

    const rampSamples = Math.max(1, Math.round(sampleRate * GAIN_RAMP_DURATION_SECONDS));
    track.targetGain = targetGain;
    track.rampIncrement = (targetGain - track.gain) / rampSamples;
    track.rampSamplesRemaining = rampSamples;
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    const blockSize = output[0]?.length ?? 0;

    if (!this.playing || this.tracks.length === 0 || blockSize === 0) {
      return true;
    }

    const trackLength = Math.max(...this.tracks.map((track) => track.length));
    let frame = 0;

    // Boucle par échantillon (pas par bloc) : un raccord de boucle A→B doit
    // pouvoir se produire au milieu d'un bloc de rendu, de façon sample-exact.
    for (; frame < blockSize; frame++) {
      if (this.masterIndex >= trackLength) {
        // Fin de piste atteinte : on arrête (pas de bouclage automatique de
        // fin de piste en v1 du POC, seule la boucle A→B explicite boucle).
        this.playing = false;
        break;
      }

      for (const track of this.tracks) {
        if (track.rampSamplesRemaining > 0) {
          track.gain += track.rampIncrement;
          track.rampSamplesRemaining--;
          if (track.rampSamplesRemaining === 0) track.gain = track.targetGain;
        }
      }

      const sampleIndex = this.masterIndex;
      for (let channel = 0; channel < output.length; channel++) {
        let sum = 0;
        for (const track of this.tracks) {
          if (sampleIndex >= track.length || track.gain === 0) continue;
          const trackChannel =
            track.channels[Math.min(channel, track.channels.length - 1)];
          sum += trackChannel[sampleIndex] * INT16_TO_FLOAT * track.gain;
        }
        output[channel][frame] = sum;
      }

      this.masterIndex++;
      if (
        this.loopStart !== null &&
        this.loopEnd !== null &&
        this.masterIndex >= this.loopEnd
      ) {
        this.masterIndex = this.loopStart;
        // Reset visuel immédiat de la position affichée au raccord.
        this.reportPosition();
      }
    }

    for (; frame < blockSize; frame++) {
      for (let channel = 0; channel < output.length; channel++) {
        output[channel][frame] = 0;
      }
    }

    const reportIntervalSamples = sampleRate * POSITION_REPORT_INTERVAL_SECONDS;
    if (
      !this.playing ||
      this.masterIndex - this.lastReportedIndex >= reportIntervalSamples
    ) {
      this.reportPosition();
    }

    return true;
  }
}

function toTrack(payload: TrackPayload): Track {
  return {
    id: payload.id,
    channels: payload.channels.map((buffer) => new Int16Array(buffer)),
    length: payload.length,
    gain: 1,
    targetGain: 1,
    rampIncrement: 0,
    rampSamplesRemaining: 0,
  };
}

registerProcessor("mixer-processor", MixerProcessor);
