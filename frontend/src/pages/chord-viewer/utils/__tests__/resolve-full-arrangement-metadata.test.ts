import { describe, it, expect } from "vitest";
import { resolveFullArrangementMetadata } from "../resolve-full-arrangement-metadata";

describe("resolveFullArrangementMetadata", () => {
  it("prefers the full arrangement's own key/tuning/capo over the simplified arrangement's", () => {
    const fullSheet = { songKey: "F#m", guitarTuning: ["E", "A", "D", "G", "B", "E"], guitarCapo: 0 };
    const simplifiedMetadata = { songKey: "G", guitarTuning: ["D", "A", "D", "G", "B", "E"], guitarCapo: 2 };

    const result = resolveFullArrangementMetadata(fullSheet, simplifiedMetadata);

    expect(result).toEqual({ songKey: "F#m", guitarTuning: ["E", "A", "D", "G", "B", "E"], guitarCapo: 0 });
  });

  it("falls back to the simplified arrangement's metadata when the full arrangement has none recorded (older cached entries)", () => {
    const fullSheet = {};
    const simplifiedMetadata = { songKey: "G", guitarTuning: ["D", "A", "D", "G", "B", "E"], guitarCapo: 2 };

    const result = resolveFullArrangementMetadata(fullSheet, simplifiedMetadata);

    expect(result).toEqual(simplifiedMetadata);
  });

  it("falls back per-field when only some full-arrangement values are recorded", () => {
    const fullSheet = { songKey: "F#m" };
    const simplifiedMetadata = { songKey: "G", guitarTuning: ["D", "A", "D", "G", "B", "E"], guitarCapo: 2 };

    const result = resolveFullArrangementMetadata(fullSheet, simplifiedMetadata);

    expect(result).toEqual({ songKey: "F#m", guitarTuning: ["D", "A", "D", "G", "B", "E"], guitarCapo: 2 });
  });

  it("uses the full arrangement's capo even when it is 0 (falsy but explicitly recorded)", () => {
    const fullSheet = { guitarCapo: 0 };
    const simplifiedMetadata = { songKey: "G", guitarTuning: ["D", "A", "D", "G", "B", "E"], guitarCapo: 2 };

    const result = resolveFullArrangementMetadata(fullSheet, simplifiedMetadata);

    expect(result.guitarCapo).toBe(0);
  });
});
