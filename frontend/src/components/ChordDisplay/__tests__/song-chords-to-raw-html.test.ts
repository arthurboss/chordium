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

  it("wraps chords grouped in parentheses, e.g. a repeated turnaround", () => {
    const result = songChordsToRawHtml("( Am  C  Am )");

    expect(result).toBe("( <b>Am</b>  <b>C</b>  <b>Am</b> )");
  });

  it("wraps chords next to a repeat marker like 2x", () => {
    const result = songChordsToRawHtml("2x  C  Am");

    expect(result).toBe("2x  <b>C</b>  <b>Am</b>");
  });

  it("wraps chords followed by a parenthesized repeat marker", () => {
    const result = songChordsToRawHtml("C  Am  (2x)");

    expect(result).toBe("<b>C</b>  <b>Am</b>  (2x)");
  });

  it("does not treat a pure repeat instruction with no chords as a chord line", () => {
    const result = songChordsToRawHtml("(repete 2x)");

    expect(result).toBe("(repete 2x)");
  });

  it("does not treat lyric lines containing chord-letter words as chord lines", () => {
    const result = songChordsToRawHtml("E o Senhor é bom");

    expect(result).toBe("E o Senhor é bom");
  });

  it("handles multiple parenthesized chord groups across lines, matching the reported song", () => {
    const input = "Aleluia, alelu____ia\n\n( Am  C  Am )\n\nSegunda Parte";
    const result = songChordsToRawHtml(input);

    expect(result).toContain("( <b>Am</b>  <b>C</b>  <b>Am</b> )");
    expect(result).toContain("Aleluia, alelu____ia");
  });

  it("wraps a half-diminished m7b5 chord", () => {
    const result = songChordsToRawHtml("Bm7b5  E7");

    expect(result).toBe("<b>Bm7b5</b>  <b>E7</b>");
  });

  it("wraps a six-nine chord without splitting off the /9 as a separate token", () => {
    const result = songChordsToRawHtml("C6/9  G");

    expect(result).toBe("<b>C6/9</b>  <b>G</b>");
  });

  it("wraps bare sus2 and sus4 chords", () => {
    const result = songChordsToRawHtml("Dsus2  Gsus4");

    expect(result).toBe("<b>Dsus2</b>  <b>Gsus4</b>");
  });

  it("wraps add9, add11, add13, add2 and add4 chords", () => {
    const result = songChordsToRawHtml("Cadd9  Fadd11  Badd13  Aadd2  Eadd4");

    expect(result).toBe("<b>Cadd9</b>  <b>Fadd11</b>  <b>Badd13</b>  <b>Aadd2</b>  <b>Eadd4</b>");
  });

  it("normalizes unicode sharp/flat symbols before wrapping chords", () => {
    const result = songChordsToRawHtml("F♯m  B♭7");

    expect(result).toBe("<b>F#m</b>  <b>Bb7</b>");
  });

  it("wraps a Brazilian cipher chord with a parenthesized extension as one token, e.g. F#m7(5-)", () => {
    const result = songChordsToRawHtml("F#m7(5-)  B7(9-)");

    expect(result).toBe("<b>F#m7(5-)</b>  <b>B7(9-)</b>");
  });

  it("wraps a bare root with only a parenthesized extension, e.g. Bb(9)", () => {
    const result = songChordsToRawHtml("Bb(9)  G");

    expect(result).toBe("<b>Bb(9)</b>  <b>G</b>");
  });

  it("wraps a parenthesized extension combined with a slash bass, e.g. D7M(9)/F#", () => {
    const result = songChordsToRawHtml("D7M(9)/F#  E7(9)");

    expect(result).toBe("<b>D7M(9)/F#</b>  <b>E7(9)</b>");
  });

  it("wraps bare power chords, e.g. D5", () => {
    const result = songChordsToRawHtml("D5   D#5");

    expect(result).toBe("<b>D5</b>   <b>D#5</b>");
  });

  it("wraps a minor power chord written with an m, e.g. Em5", () => {
    const result = songChordsToRawHtml("Em5   F#5 G5");

    expect(result).toBe("<b>Em5</b>   <b>F#5</b> <b>G5</b>");
  });

  it("wraps a bare-number slash suffix as one token, e.g. D7/4", () => {
    const result = songChordsToRawHtml("C9                D7/4");

    expect(result).toBe("<b>C9</b>                <b>D7/4</b>");
  });
});
