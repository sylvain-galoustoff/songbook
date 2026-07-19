import type {
  MainToWorkletMessage,
  TrackPayload,
  WorkletToMainMessage,
} from "./worklet/protocol";
import type { TrackByteProvider, TrackRequest } from "./trackProvider";
// "?worker&url" force Vite à transpiler ce module et à l'émettre comme
// fichier séparé (pas de la même façon qu'un asset générique) : nécessaire
// pour que le worklet reçoive du JS valide, pas la source TS brute inlinée.
import mixerProcessorUrl from "./worklet/mixer-processor.ts?worker&url";

export const SAMPLE_RATE = 44100;

export interface TrackSource {
  id: string;
  instrument: string;
  durationSamples: number;
  channels: number;
}

export interface LoopRange {
  start: number | null;
  end: number | null;
}

// Erreur de chargement identifiant la piste fautive : une piste manquante ou
// indécodable bloque tout le morceau (cf. audio-engine.md), mais l'appelant
// doit pouvoir dire laquelle a échoué plutôt qu'un échec générique.
export class TrackLoadError extends Error {
  readonly trackId: string;
  readonly instrument: string;

  constructor(source: TrackRequest, cause: unknown) {
    super(`Échec du chargement de la piste "${source.instrument}".`);
    this.name = "TrackLoadError";
    this.trackId = source.id;
    this.instrument = source.instrument;
    this.cause = cause;
  }
}

// Moteur audio : un seul AudioContext + un seul AudioWorkletNode qui mixe
// toutes les pistes. Voir .claude/rules/audio-engine.md.
export class AudioEngine {
  private readonly context: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private readonly workletReady: Promise<void>;
  private durationSamples = 0;
  private onPosition: ((index: number) => void) | null = null;
  private onLoopChange: ((loop: LoopRange) => void) | null = null;

  constructor() {
    this.context = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.workletReady = this.setupWorklet();
  }

  private async setupWorklet(): Promise<void> {
    await this.context.audioWorklet.addModule(mixerProcessorUrl);
    this.workletNode = new AudioWorkletNode(this.context, "mixer-processor", {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    this.workletNode.port.onmessage = (
      event: MessageEvent<WorkletToMainMessage>,
    ) => {
      const data = event.data;
      if (data.type === "position") {
        this.onPosition?.(data.index);
      } else if (data.type === "loop") {
        this.onLoopChange?.({ start: data.start, end: data.end });
      }
    };
    this.workletNode.connect(this.context.destination);
  }

  setPositionListener(listener: ((index: number) => void) | null): void {
    this.onPosition = listener;
  }

  setLoopListener(listener: ((loop: LoopRange) => void) | null): void {
    this.onLoopChange = listener;
  }

  getDurationSamples(): number {
    return this.durationSamples;
  }

  async loadTracks(
    sources: TrackRequest[],
    provider: TrackByteProvider,
  ): Promise<TrackSource[]> {
    await this.workletReady;

    const arrayBuffers = await Promise.all(
      sources.map(async (source) => {
        try {
          return await provider.fetchTrackBytes(source);
        } catch (error) {
          throw new TrackLoadError(source, error);
        }
      }),
    );

    const tracks: TrackPayload[] = [];
    const trackSources: TrackSource[] = [];
    const transferables: ArrayBuffer[] = [];

    // Décodage séquentiel : décoder toutes les pistes en parallèle ferait
    // coexister N buffers Float32 en RAM en même temps (pic mémoire à éviter).
    for (let i = 0; i < sources.length; i++) {
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await this.context.decodeAudioData(arrayBuffers[i]);
      } catch (error) {
        throw new TrackLoadError(sources[i], error);
      }
      const channels: ArrayBuffer[] = [];
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const buffer = float32ToInt16(audioBuffer.getChannelData(channel))
          .buffer as ArrayBuffer;
        channels.push(buffer);
        transferables.push(buffer);
      }
      tracks.push({ id: sources[i].id, channels, length: audioBuffer.length });
      trackSources.push({
        id: sources[i].id,
        instrument: sources[i].instrument,
        durationSamples: audioBuffer.length,
        channels: audioBuffer.numberOfChannels,
      });
    }

    this.durationSamples = Math.max(...tracks.map((track) => track.length));
    this.postMessage({ type: "loadTracks", tracks }, transferables);
    return trackSources;
  }

  async play(): Promise<void> {
    // Débloque l'AudioContext sur interaction utilisateur (contrainte iOS).
    await this.context.resume();
    this.postMessage({ type: "play" });
  }

  pause(): void {
    this.postMessage({ type: "pause" });
  }

  setTrackMuted(id: string, muted: boolean): void {
    this.postMessage({ type: "setTrackGain", id, gain: muted ? 0 : 1 });
  }

  seek(index: number): void {
    this.postMessage({ type: "seek", index });
  }

  toggleLoopPoint(): void {
    this.postMessage({ type: "toggleLoopPoint" });
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
