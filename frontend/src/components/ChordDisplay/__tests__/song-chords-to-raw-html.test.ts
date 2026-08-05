import { describe, it, expect, vi } from "vitest";

vi.mock("i18next", () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        "sectionTitles.intro": "Intro",
        "sectionTitles.verse": "Verse",
        "sectionTitles.chorus": "Chorus",
        "sectionTitles.preChorus": "Pre-Chorus",
        "sectionTitles.bridge": "Bridge",
        "sectionTitles.outro": "Outro",
        "sectionTitles.solo": "Solo",
        "sectionTitles.interlude": "Interlude",
      };
      return translations[key];
    },
  },
}));

import { songChordsToRawHtml } from "../song-chords-to-raw-html";

describe("songChordsToRawHtml", () => {
  it("renders a section title on its own line as a heading", () => {
    const result = songChordsToRawHtml("[Primeira Parte]\nC  Am");

    expect(result).toContain('<span class="section-title">Primeira Parte</span>');
  });

  it("renders a section title followed by chords on the same line as a heading plus a chord line", () => {
    const result = songChordsToRawHtml("[Intro] C  Am  C  Am");

    expect(result).toContain('<span class="section-title">Intro</span>');
    expect(result).toContain("<b>C</b>");
    expect(result).toContain("<b>Am</b>");
    // The chord line should not still be embedded inside the section-title span.
    expect(result).not.toMatch(/section-title">Intro[^<]*C/);
  });

  it("wraps chords on a plain chord line", () => {
    const result = songChordsToRawHtml("C            G");

    expect(result).toBe("<b>C</b>            <b>G</b>");
  });

  it("keeps lyrics lines untouched", () => {
    const result = songChordsToRawHtml("Pai eu quero te amar");

    expect(result).toBe("Pai eu quero te amar");
  });

  it("collects consecutive tab lines into a single tablatura block", () => {
    const tab = ["E|-0-1-2-|", "B|-0-1-2-|", "G|-0-1-2-|", "D|-0-1-2-|", "A|-0-1-2-|", "E|-0-1-2-|"].join("\n");
    const result = songChordsToRawHtml(tab);

    expect(result).toContain('<span class="tablatura">');
    expect(result).toContain('<span class="cnt">');
    expect(result).toContain("E|-0-1-2-|");
  });

  it("handles a full section followed by a chord-only intro line, matching the reported bug", () => {
    const input = "[Intro] C  Am  C  Am\n\n[Primeira Parte]\n\nC            G\nPai eu quero te amar";
    const result = songChordsToRawHtml(input);

    expect(result).toContain('<span class="section-title">Intro</span>');
    expect(result).toContain('<span class="section-title">Primeira Parte</span>');
    expect(result).toContain("<b>C</b>            <b>G</b>");
    expect(result).toContain("Pai eu quero te amar");
  });
});
