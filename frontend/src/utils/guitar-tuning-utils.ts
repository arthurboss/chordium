import { GUITAR_TUNINGS, type GuitarTuning } from "@/constants/guitar-tunings";

/**
 * Converts a free-form tuning string (e.g. "E-A-D-G-B-E" or "Drop D") into a
 * GuitarTuning tuple. Falls back to STANDARD when it can't be parsed into 6 notes.
 */
export function mapStringToGuitarTuning(tuning: string): GuitarTuning {
  const normalized = tuning.trim().toLowerCase();

  for (const key in GUITAR_TUNINGS) {
    const known = GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS];
    if (
      key.toLowerCase() === normalized ||
      known.join("-").toLowerCase() === normalized.replace(/\s+/g, "-")
    ) {
      return known;
    }
  }

  const notes = tuning.trim().split(/[-\s]+/).filter(Boolean);
  if (notes.length === 6) {
    return notes as unknown as GuitarTuning;
  }

  return GUITAR_TUNINGS.STANDARD;
}

/** Formats a GuitarTuning (or string) for display/editing as "E-A-D-G-B-E". */
export function guitarTuningToString(tuning: GuitarTuning | string | undefined): string {
  if (!tuning) return "";
  return Array.isArray(tuning) ? tuning.join("-") : tuning;
}
