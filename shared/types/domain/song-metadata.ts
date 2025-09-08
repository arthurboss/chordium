import { GuitarTuning } from "../metadata/guitar-tuning.js";

export interface SongMetadata {
    title: string; // Song title. Must be provided.
    artist: string; // if unavailable, it should be "Unknown Artist"
    songKey: string; // Empty string if not available
    guitarTuning: GuitarTuning;
    guitarCapo: number; // Capo position, 0 if not available since it is the default value
}
