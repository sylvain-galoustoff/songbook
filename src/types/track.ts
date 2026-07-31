import type { InstrumentId } from "./instrument";
import type { ValidatedTrackMetadata } from "../audio/trackValidation";

export interface WizardTrack {
  instrument: InstrumentId;
  file: File;
  metadata: ValidatedTrackMetadata;
}

export type TrackModeChoice = "single" | "multi";

// Instrument placeholder pour une piste "simple piste" (pas d'instrument
// choisi par l'utilisateur). Le futur lecteur simplifié distinguera ce cas
// via `SongRecord.trackMode`, pas via cette valeur (cf. IoDiscSharp prévu
// côté lecteur).
export const SINGLE_TRACK_INSTRUMENT_ID = "single";
