import type { MainToWorkletMessage, TrackPayload } from "./worklet/protocol";
// "?worker&url" force Vite à transpiler ce module et à l'émettre comme
// fichier séparé (pas de la même façon qu'un asset générique) : nécessaire
// pour que le worklet reçoive du JS valide, pas la source TS brute inlinée.
import mixerProcessorUrl from "./worklet/mixer-processor.ts?worker&url";

export interface TrackSource {
  id: string;
  url: string;
}

// Moteur audio : un seul AudioContext + un seul AudioWorkletNode qui mixe
// toutes les pistes. Voir .claude/rules/audio-engine.md.
export class AudioEngine {
  private readonly context: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private readonly workletReady: Promise<void>;

  constructor() {
    this.context = new AudioContext({ sampleRate: 44100 });
    this.workletReady = this.setupWorklet();
  }

  private async setupWorklet(): Promise<void> {
    await this.context.audioWorklet.addModule(mixerProcessorUrl);
    this.workletNode = new AudioWorkletNode(this.context, "mixer-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    this.workletNode.connect(this.context.destination);
  }

  async loadTracks(sources: TrackSource[]): Promise<void> {
    await this.workletReady;

    const arrayBuffers = await Promise.all(
      sources.map((source) =>
        fetch(source.url).then((response) => response.arrayBuffer()),
      ),
    );

    const tracks: TrackPayload[] = [];
    const transferables: ArrayBuffer[] = [];

    // Décodage séquentiel : décoder toutes les pistes en parallèle ferait
    // coexister N buffers Float32 en RAM en même temps (pic mémoire à éviter).
    for (let i = 0; i < sources.length; i++) {
      const audioBuffer = await this.context.decodeAudioData(arrayBuffers[i]);
      const channels: ArrayBuffer[] = [];
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const buffer = float32ToInt16(audioBuffer.getChannelData(channel))
          .buffer as ArrayBuffer;
        channels.push(buffer);
        transferables.push(buffer);
      }
      tracks.push({ id: sources[i].id, channels, length: audioBuffer.length });
    }

    this.postMessage({ type: "loadTracks", tracks }, transferables);
  }

  async play(): Promise<void> {
    // Débloque l'AudioContext sur interaction utilisateur (contrainte iOS).
    await this.context.resume();
    this.postMessage({ type: "play" });
  }

  pause(): void {
    this.postMessage({ type: "pause" });
  }

  dispose(): void {
    this.workletNode?.disconnect();
    void this.context.close();
  }

  private postMessage(
    message: MainToWorkletMessage,
    transfer: Transferable[] = [],
  ): void {
    if (!this.workletNode) {
      throw new Error("Worklet non prêt");
    }
    this.workletNode.port.postMessage(message, transfer);
  }
}

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return int16;
}
