import { describe, it, expect } from "vitest";
import type { SearchHit } from "@chordium/types";
import { filterSearchHitsByText } from "../filterSearchHitsByText";

const artist: SearchHit = { type: "artist", displayName: "AC/DC", path: "ac-dc", songCount: 42 };
const song: SearchHit = { type: "song", title: "Thunderstruck", artist: "AC/DC", path: "ac-dc/thunderstruck" };
const other: SearchHit = { type: "song", title: "Wonderwall", artist: "Oasis", path: "oasis/wonderwall" };

describe("filterSearchHitsByText", () => {
  it("returns everything when there's no filter text", () => {
    expect(filterSearchHitsByText([artist, song, other], "")).toEqual([artist, song, other]);
  });

  it("matches an artist by display name, accents and case aside", () => {
    expect(filterSearchHitsByText([artist, other], "ac dc")).toEqual([artist]);
  });

  it("matches an artist by path even where the display name differs", () => {
    expect(filterSearchHitsByText([artist], "ac-dc")).toEqual([artist]);
  });

  it("matches a song by title", () => {
    expect(filterSearchHitsByText([song, other], "thunder")).toEqual([song]);
  });

  it("matches a song by its artist rather than only its title", () => {
    expect(filterSearchHitsByText([song, other], "AC/DC")).toEqual([song]);
  });

  it("drops hits that match neither field", () => {
    expect(filterSearchHitsByText([song, other], "metallica")).toEqual([]);
  });
});
