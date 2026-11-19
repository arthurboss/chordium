import { describe, it, expect } from "vitest";
import toTitleCase from "../to-title-case";

describe("toTitleCase", () => {
  it("capitalizes each word", () => {
    expect(toTitleCase("worship songs")).toBe("Worship Songs");
  });

  it("collapses extra whitespace", () => {
    expect(toTitleCase("  chill   vibes  ")).toBe("Chill Vibes");
  });

  it("lowercases the rest of a shouted word", () => {
    expect(toTitleCase("WORSHIP SONGS")).toBe("Worship Songs");
  });

  it("capitalizes a single word", () => {
    expect(toTitleCase("favorites")).toBe("Favorites");
  });
});
