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
    }
  }

  // seek déplace uniquement l'index maître : toutes les pistes suivent
  // instantanément, toujours alignées (aucune reconstruction de nœud).
  private seek(targetIndex: number): void {
    if (this.tracks.length === 0) return;
    const trackLength = Math.max(...this.tracks.map((track) => track.length));
    this.masterIndex = Math.max(0, Math.min(targetIndex, trackLength - 1));
    this.reportPosition();
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
    const remaining = trackLength - this.masterIndex;
    const framesToRender = Math.max(0, Math.min(blockSize, remaining));

    for (let frame = 0; frame < framesToRender; frame++) {
      const sampleIndex = this.masterIndex + frame;

      for (const track of this.tracks) {
        if (track.rampSamplesRemaining > 0) {
          track.gain += track.rampIncrement;
          track.rampSamplesRemaining--;
          if (track.rampSamplesRemaining === 0) track.gain = track.targetGain;
        }
      }

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
    }

    for (let frame = framesToRender; frame < blockSize; frame++) {
      for (let channel = 0; channel < output.length; channel++) {
        output[channel][frame] = 0;
      }
    }

    this.masterIndex += framesToRender;
    if (framesToRender < blockSize) {
      // Fin de piste atteinte : on arrête (pas de bouclage en v1 du POC).
      this.playing = false;
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
