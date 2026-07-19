import type { InstrumentId } from "./instrument";
import type { ValidatedTrackMetadata } from "../audio/trackValidation";

export interface WizardTrack {
  instrument: InstrumentId;
  file: File;
  metadata: ValidatedTrackMetadata;
}
