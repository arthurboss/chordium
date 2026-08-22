/**
 * The single source of truth for recognizing a chord token in free text —
 * root note, accidental, quality/extension, an optional Brazilian-cipher
 * parenthesized extension, and an optional bass/slash suffix.
 *
 * This is a raw regex-source *string*, not a compiled RegExp, so it can
 * cross the `page.evaluate()` serialization boundary: `extractFullChordSheet`
 * in `extractors.ts` runs inside a headless browser tab, where it can only
 * reference the DOM and its own parameters — no imports or closures — so it
 * receives this string as an explicit `page.evaluate(fn, arg)` argument
 * rather than importing it directly. See `cascade.ts` for that call site.
 *
 * Callers that need a full token boundary (to extract/wrap a match, e.g. for
 * transposition or `<b>` highlighting) should wrap this in their own capture
 * group and trailing negative lookahead — see `CHORD_REGEX` in
 * `frontend/src/utils/chord-sheet-utils.ts` for that usage. Callers that only
 * need to strip every chord token and check what's left (e.g. "is this line
 * chords-only?") can use this pattern as-is.
 *
 * "6/9" must stay listed before the bare "6" alternative: "6" alone is a
 * valid match too (its bass-slash suffix just fails to consume "/9" since
 * "9" isn't a note letter), so if "6" matched first, the leftover "/9" —
 * specifically the "/" — wouldn't be recognized as part of the chord by
 * either kind of caller.
 *
 * The trailing (?:\(\d{1,2}[+-]?\))? covers the Brazilian cipher convention
 * of a parenthesized extension after the quality — e.g. "F#m7(5-)"
 * (half-diminished), "D7M(9)", "F7(11+)" — confirmed on real bossa nova chord
 * sheets (Tom Jobim, João Gilberto). It's independent of the quality group,
 * so it also matches a bare extension straight off the root, e.g. "Bb(9)".
 *
 * Bare "5" (power chord, e.g. "D5", "F#5") and "m5" (same, written with an
 * "m" despite the third being absent, e.g. "Em5") were added after finding
 * them undetected on real rock chord sheets (Cazuza, Legião Urbana).
 *
 * The trailing slash group accepts either a real bass-note letter (the
 * standard slash chord, e.g. "G/B") or a bare 1-2 digit number (e.g.
 * "D7/4") — CifraClub's own authored markup confirms real transcribers use
 * "/N" as shorthand for an added scale-degree alongside the same song's
 * bare "D4" (add4) chord. Digits there are intentionally never transposed —
 * a scale degree relative to the root doesn't change when the root does,
 * unlike an actual bass note.
 */
export const CHORD_TOKEN_PATTERN =
  "[A-G][#b]?(?:m|maj|min|aug|dim|sus|sus2|sus4|add|add9|add11|add13|add2|add4|maj7|m7|m7b5|7M|9M|11M|13M|7|9|11|13|6\\/9|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7|m5|5|4|2)?(?:\\(\\d{1,2}[+-]?\\))?(?:\\/(?:[A-G][#b]?|\\d{1,2}))?";
