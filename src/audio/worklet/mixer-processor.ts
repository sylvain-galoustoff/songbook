import type { MainToWorkletMessage, TrackPayload } from "./protocol";

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

interface Track {
  channels: Int16Array[];
  length: number;
}

const INT16_TO_FLOAT = 1 / 32768;

// Index de lecture maître unique = seule source de vérité de la position.
// Toutes les pistes sont lues au même index : la synchro est intrinsèque.
class MixerProcessor extends AudioWorkletProcessor {
  private tracks: Track[] = [];
  private masterIndex = 0;
  private playing = false;

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
        this.playing = false;
        break;
      case "play":
        this.playing = true;
        break;
      case "pause":
        this.playing = false;
        break;
    }
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
      for (let channel = 0; channel < output.length; channel++) {
        let sum = 0;
        for (const track of this.tracks) {
          if (sampleIndex >= track.length) continue;
          const trackChannel =
            track.channels[Math.min(channel, track.channels.length - 1)];
          sum += trackChannel[sampleIndex] * INT16_TO_FLOAT;
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

    return true;
  }
}

function toTrack(payload: TrackPayload): Track {
  return {
    channels: payload.channels.map((buffer) => new Int16Array(buffer)),
    length: payload.length,
  };
}

registerProcessor("mixer-processor", MixerProcessor);
