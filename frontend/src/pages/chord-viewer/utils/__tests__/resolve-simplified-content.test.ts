import { describe, it, expect } from "vitest";
import { resolveSimplifiedContentForFullEdit } from "../resolve-simplified-content";

describe("resolveSimplifiedContentForFullEdit", () => {
  it("prefers the just-saved simplified edit over the loaded content", () => {
    const result = resolveSimplifiedContentForFullEdit("edited chords", "original loaded chords");

    expect(result).toBe("edited chords");
  });

  it("falls back to the loaded content when no simplified edit was saved this session", () => {
    const result = resolveSimplifiedContentForFullEdit(undefined, "original loaded chords");

    expect(result).toBe("original loaded chords");
  });

  it("falls back to an empty string when neither is available", () => {
    const result = resolveSimplifiedContentForFullEdit(undefined, undefined);

    expect(result).toBe("");
  });
});
