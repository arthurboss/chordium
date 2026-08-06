import type { SongMetadata } from "@chordium/types";

type ArrangementMetadata = Pick<SongMetadata, "songKey" | "guitarTuning" | "guitarCapo">;

/**
 * Resolves which key/tuning/capo to display for the full arrangement.
 *
 * CifraClub's full (tab) page can report a different key/tuning/capo than
 * the simplified page for the same song -- e.g. a tab arrangement using an
 * alternate fingering shape. Prefer the full arrangement's own values, and
 * fall back to the simplified arrangement's only for entries cached before
 * the full arrangement's metadata was tracked (where the field is absent).
 */
export function resolveFullArrangementMetadata(
  fullSheet: Partial<ArrangementMetadata>,
  simplifiedMetadata: ArrangementMetadata
): ArrangementMetadata {
  return {
    songKey: fullSheet.songKey ?? simplifiedMetadata.songKey,
    guitarTuning: fullSheet.guitarTuning ?? simplifiedMetadata.guitarTuning,
    guitarCapo: fullSheet.guitarCapo ?? simplifiedMetadata.guitarCapo,
  };
}
