import type { ChordSheet, SongMetadata, GuitarTuning } from "@chordium/types";

/**
 * Extracts a full chord sheet (content + metadata) from a CifraClub page.
 *
 * IMPORTANT: this function body is serialized and executed inside the browser
 * via `page.evaluate`, so it may only reference the DOM and its own locals —
 * no imports or closures over outside variables. It's fine to accept
 * parameters, though: `page.evaluate(fn, ...args)` serializes those args and
 * passes them in for real, unlike a closure. `chordTokenPattern` arrives this
 * way — see `chord-token-pattern.ts` for why it can't just be imported here,
 * and `cascade.ts` for the call site that supplies it.
 *
 * Returns both plain-text `songChords` and `rawHtml` that preserves the
 * source's own `<b>` chord markup. The frontend renders `rawHtml` directly, so
 * chord highlighting comes from the source (which already marks every chord)
 * rather than a client-side regex that can never enumerate every chord shape.
 *
 * Works on both regular song pages and print pages (`imprimir.html`), which
 * render some metadata differently (bare text / bare h2 instead of anchors).
 * Print pages also paginate long songs across multiple `<pre>` elements (one
 * per printed page) — every `<pre>` on the page is read and concatenated, since
 * reading only the first silently drops the rest of the song.
 */
export function extractFullChordSheet(chordTokenPattern: string): ChordSheet & SongMetadata {
  const preElements = Array.from(document.querySelectorAll("pre"));
  let songChords = "";
  let rawHtml: string | undefined;
  // Non-standard tunings are usually a `span#cifra_afi a` anchor, but some
  // pages instead render a plain "Afinação: <notes>" line as the very first
  // line of the pre block, with no anchor at all. Detected below and used
  // both to strip it from the extracted content and as a tuning fallback.
  const leadingTuningLineRegex = /^Afinação:\s*([A-G][#b]?(?:\s+[A-G][#b]?){5})\s*\n+/i;
  let leadingTuningMatch: RegExpMatchArray | null = null;

  // Drops a bare section-title line when it's immediately followed (skipping
  // blank lines) by another one, but ONLY when that's actually safe: if the
  // second header is "Tab -"/"Dedilhado -" prefixed, its tab run is skipped
  // ahead first, and the drop only happens if nothing but another header (or
  // the end) follows. Some sections share one header for both a tab run and
  // the real chords/lyrics that resume right after it (e.g. a bare "[X]"
  // immediately followed by "[Tab - X]", with the section's actual lyrics
  // appearing only after the tab content ends) — collapsing the pair there
  // would leave that trailing content with no header of its own. Sections
  // that really are just a duplicate ("[X]" then "[Tab - X]" with nothing
  // else in the section) still collapse to the more specific one as before.
  function dedupeAdjacentHeaders(
    text: string,
    isHeaderLine: (line: string) => boolean,
    extractTitle: (line: string) => string | null,
    isTabContinuation: (lines: string[], i: number) => boolean
  ): string {
    const lines = text.split("\n");
    const result: string[] = [];
    let i = 0;
    while (i < lines.length) {
      if (isHeaderLine(lines[i].trim())) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j < lines.length && isHeaderLine(lines[j].trim())) {
          const nextTitle = extractTitle(lines[j].trim());
          const nextIsTabPrefixed = !!nextTitle && /^(tab|dedilhado)\b/i.test(nextTitle.trim());
          if (nextIsTabPrefixed) {
            let k = j + 1;
            while (k < lines.length && isTabContinuation(lines, k)) k++;
            const safeToCollapse = k >= lines.length || isHeaderLine(lines[k].trim());
            if (safeToCollapse) {
              i = j;
              continue;
            }
          } else {
            i = j;
            continue;
          }
        }
      }
      result.push(lines[i]);
      i++;
    }
    return result.join("\n");
  }

  // Ensures exactly one blank line before every header line (never zero,
  // never more), except at the very start of the content where there's
  // nothing to separate it from. No blank line is added after — the
  // divider rendered under the header already provides that separation.
  function normalizeHeaderBlankLines(text: string, isHeaderLine: (line: string) => boolean): string {
    const lines = text.split("\n");
    const result: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (isHeaderLine(line.trim())) {
        while (result.length > 0 && result[result.length - 1].trim() === "") {
          result.pop();
        }
        if (result.length > 0) result.push("");
        result.push(line);
        let k = i + 1;
        while (k < lines.length && lines[k].trim() === "") k++;
        i = k;
        continue;
      }
      result.push(line);
      i++;
    }
    return result.join("\n");
  }

  // Some sections mix chord-only content and a tab block under a single
  // header with no separate "Tab - <title>" counterpart (the source doesn't
  // always split them the way it does for e.g. "[Intro]" + "[Tab - Intro]").
  // Without that second header, the "hide tabs" toggle has nothing tab-named
  // to strip and leaves the tab block's "Parte N de M" labels and dash lines
  // behind. Detect where a tab run starts inside a section whose header
  // isn't already "Tab"-prefixed, and insert one right before it.
  function insertMissingTabHeaders(
    text: string,
    isHeaderLine: (line: string) => boolean,
    extractTitle: (line: string) => string | null,
    makeHeaderLine: (title: string) => string,
    isTabRunStart: (line: string) => boolean
  ): string {
    const lines = text.split("\n");
    const result: string[] = [];
    let currentTitle: string | null = null;
    let insertedForSection = false;
    for (const line of lines) {
      if (isHeaderLine(line.trim())) {
        currentTitle = extractTitle(line.trim());
        insertedForSection = false;
        result.push(line);
        continue;
      }
      if (!insertedForSection && currentTitle && !/^(tab|dedilhado)\b/i.test(currentTitle.trim()) && isTabRunStart(line)) {
        result.push(makeHeaderLine("Tab - " + currentTitle));
        insertedForSection = true;
      }
      result.push(line);
    }
    return result.join("\n");
  }

  if (preElements.length > 0) {
    // Plain-text content. Tab blocks are plain text too (their dash-drawn
    // strings, e.g. "E|----7-10-...|", are already self-identifying), so no
    // wrapper markers are needed — and none are added, since bracket-style
    // markers would collide with the "[Section]" convention used elsewhere
    // and render as bogus section headers when rawHtml is unavailable.
    preElements.forEach((preElement) => {
      preElement.childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          songChords += node.textContent || "";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          songChords += (node as Element).textContent || "";
        }
      });
      songChords += "\n";
    });

    leadingTuningMatch = songChords.match(leadingTuningLineRegex);
    if (leadingTuningMatch) {
      songChords = songChords.slice(leadingTuningMatch[0].length);
    }
    // Normalizes unicode accidentals (♭, ♯) to the ASCII 'b'/'#' below and the
    // frontend's transposeChord() both recognize, so sheets that use the
    // musical symbols still get detected and transpose correctly. Mirrors
    // normalizeChordAccidentals in frontend/src/utils/chord-sheet-utils.ts —
    // duplicated (not imported) because this function body is serialized for
    // page.evaluate and can't reference outside code.
    songChords = songChords.replace(/♭/g, "b").replace(/♯/g, "#");
    // Recognizes a chord-only line (e.g. "   Am               C   ") the same
    // way isChordLine elsewhere in the app does: strip every chord token and
    // check that nothing but whitespace/decoration is left. See
    // chord-token-pattern.ts for what chordTokenPattern actually matches.
    function isPlainChordOnlyLine(line: string): boolean {
      if (!/[A-G]/.test(line)) return false;
      const stripped = line.replace(new RegExp(chordTokenPattern, "g"), "");
      return /^[\s()[\]{}xX0-9.,:-]*$/.test(stripped);
    }
    function isPlainTabContinuation(lines: string[], i: number): boolean {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed === "") return true;
      if (/^[EBGDAe]\|[-\d]/.test(trimmed)) return true;
      if (/^\s*Parte \d+ [Dd]e \d+\s*$/.test(line)) return true;
      if (/^[ \t]*[↓↑][ \t↓↑]*$/.test(line)) return true;
      if (isPlainChordOnlyLine(trimmed)) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j >= lines.length) return false;
        const next = lines[j];
        return /^[EBGDAe]\|[-\d]/.test(next.trim()) || /^\s*Parte \d+ [Dd]e \d+\s*$/.test(next);
      }
      return false;
    }

    const isBareBracketHeader = (line: string) => /^\[[^\]]+\]$/.test(line);
    const isTabRunStartPlain = (line: string) => /^[EBGDAe]\|[-\d]/.test(line) || /^\s*Parte \d+ [Dd]e \d+\s*$/.test(line);
    songChords = insertMissingTabHeaders(
      songChords,
      (line) => /^\[[^\]]+\]/.test(line),
      (line) => line.match(/^\[([^\]]+)\]/)?.[1] ?? null,
      (title) => "[" + title + "]",
      isTabRunStartPlain
    );
    songChords = dedupeAdjacentHeaders(
      songChords,
      isBareBracketHeader,
      (line) => line.match(/^\[([^\]]+)\]/)?.[1] ?? null,
      isPlainTabContinuation
    );
    songChords = normalizeHeaderBlankLines(songChords, isBareBracketHeader);

    // rawHtml: keep only text, <b> (chords) and <span> (styling), stripping all
    // attributes except class on span. Preserves the source's chord markup.
    function sanitizeNode(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      if (tag !== "b" && tag !== "span") {
        return Array.from(el.childNodes).map(sanitizeNode).join("");
      }
      const classAttr = el.getAttribute("class");
      const openTag = classAttr
        ? `<${tag} class="${classAttr.replace(/"/g, "&quot;")}">`
        : `<${tag}>`;
      const inner = Array.from(el.childNodes).map(sanitizeNode).join("");
      return `${openTag}${inner}</${tag}>`;
    }

    let rawHtmlRaw = preElements
      .map((preElement) => Array.from(preElement.childNodes).map(sanitizeNode).join("") + "\n")
      .join("");
    // Same leading line as above, verbatim (it's a plain text node, not
    // wrapped in <b>/<span>, so it appears unchanged in the sanitized HTML).
    rawHtmlRaw = rawHtmlRaw.replace(leadingTuningLineRegex, "");
    // Print pages render tab blocks as bare text with no <span class="tablatura">
    // wrapper at all (unlike regular pages, whose native markup is preserved
    // above by sanitizeNode) — their dash-drawn strings (e.g. "E|----7-10-...|")
    // then inherit whatever font the reader picked instead of staying
    // monospace, breaking the ASCII alignment. Detect and wrap them the same
    // way the source's own regular pages do, so the existing .tablatura/.cnt
    // CSS can force the alignment. Skipped when tablatura markup is already
    // present (the regular-page fallback route) to avoid double-wrapping.
    if (!/<span class="tablatura">/.test(rawHtmlRaw)) {
      const tabLineRegex = /^[EBGDAe]\|[-\d]/;
      const rawLines = rawHtmlRaw.split("\n");
      const wrapped: string[] = [];
      let idx = 0;
      while (idx < rawLines.length) {
        if (tabLineRegex.test(rawLines[idx])) {
          // A "Parte N de M" section can hold several dash-drawn string
          // groups back to back, each meant to stay visually separated by
          // exactly one blank line — collapse any run of several into one,
          // but keep it (dropping it entirely is what merged them together).
          const block: string[] = [];
          while (
            idx < rawLines.length &&
            (tabLineRegex.test(rawLines[idx]) || (block.length > 0 && rawLines[idx].trim() === ""))
          ) {
            if (tabLineRegex.test(rawLines[idx])) {
              block.push(rawLines[idx]);
            } else if (block[block.length - 1]?.trim() !== "") {
              block.push("");
            }
            idx++;
          }
          while (block.length > 0 && block[block.length - 1].trim() === "") {
            block.pop();
          }
          wrapped.push('<span class="tablatura"><span class="cnt">' + block.join("\n") + "</span></span>");
        } else {
          wrapped.push(rawLines[idx]);
          idx++;
        }
      }
      rawHtmlRaw = wrapped.join("\n");
    }
    // Some tab blocks close the tablatura span before the last string, leaving
    // the 6th string (e.g. "E|----|") as a bare line after </span></span> — or
    // before a fret-hand direction row (e.g. "↓  ↑ ↓") that annotates the tab
    // just above it. Absorb both back inside the cnt span so the whole tab
    // block renders (and gets removed together when tabs are hidden) as one.
    rawHtmlRaw = rawHtmlRaw.replace(
      /(<\/span>)(<\/span>)((?:\n(?:[ \t]*[EADGBe]\|[-\d][^\n]*|[ \t]*[↓↑][ \t↓↑]*))+)/g,
      (_m, closeCnt, closeTab, orphanLines) => orphanLines + closeCnt + closeTab
    );
    const lines = rawHtmlRaw.split("\n");
    const result: string[] = [];
    let dedentAmount = 0;
    for (let i = 0; i < lines.length; i++) {
      const sectionMatch = lines[i].match(/^(<span class="tablatura">)?(\[(?:[^\]]+)\])\s?(.*)/);
      if (sectionMatch) {
        const prefix = sectionMatch[1] || "";
        result.push(prefix + '<span class="section-title">' + sectionMatch[2].slice(1, -1) + "</span>");
        dedentAmount = sectionMatch[2].length + 1;
        if (sectionMatch[3]) result.push(sectionMatch[3]);
      } else if (dedentAmount > 0 && lines[i].startsWith(" ".repeat(dedentAmount))) {
        result.push(lines[i].slice(dedentAmount));
      } else {
        if (lines[i] === "") dedentAmount = 0;
        result.push(lines[i]);
      }
    }
    // Native regular-page markup wraps each tab sub-block in its own
    // <span class="tablatura">, sometimes with a "[Section]" bracket right
    // on the same line as its opening tag (e.g. simplified print pages'
    // "<span class="tablatura">[Dedilhado - Intro]") — so a header line and
    // a tab-continuation line can each start with that tag.
    const isSectionTitleLine = (line: string) =>
      /^(?:<span class="tablatura">)?<span class="section-title">.*<\/span>$/.test(line);
    function isHtmlTabContinuation(lines: string[], i: number): boolean {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed === "") return true;
      if (
        line.includes('<span class="tablatura">') ||
        line.includes('<span class="cnt">') ||
        line.includes("</span></span>")
      ) {
        return true;
      }
      if (/Parte \d+ [Dd]e \d+/.test(line)) return true;
      if (/^[EBGDAe]\|[-\d]/.test(trimmed)) return true;
      if (/^[ \t]*[↓↑][ \t↓↑]*$/.test(line)) return true;
      if (/^(?:<b>[^<]*<\/b>\s*)+$/.test(trimmed)) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j >= lines.length) return false;
        const next = lines[j];
        return (
          next.includes('<span class="tablatura">') ||
          next.includes('<span class="cnt">') ||
          /Parte \d+ [Dd]e \d+/.test(next) ||
          /^[EBGDAe]\|[-\d]/.test(next.trim())
        );
      }
      return false;
    }
    const rawHtmlBuilt = result
      .join("\n")
      .replace(/\n{2,}(<span class="section-title">)/g, "\n\n$1")
      .replace(/(<\/span>)\n\n+/g, "$1\n")
      .replace(
        /(<span class="tablatura">)((?:(?!<span class="cnt">)[\s\S])*?)(<span class="cnt">)/g,
        (_m: string, open: string, content: string, cnt: string) => {
          const contentLines = content.split("\n");
          const tabInfoLines: string[] = [];
          const chordAnnotationLines: string[] = [];
          for (const line of contentLines) {
            if (line.includes("<b>") && !line.includes('<span class="section-title">')) {
              chordAnnotationLines.push(line);
            } else if (line.trim() && !line.includes('<span class="section-title">')) {
              tabInfoLines.push('<span class="tab-info">' + line + "</span>");
            } else {
              tabInfoLines.push(line);
            }
          }
          const prefix = chordAnnotationLines.length > 0 ? chordAnnotationLines.join("\n") + "\n" : "";
          return open + tabInfoLines.join("\n") + cnt + prefix;
        }
      );
    const isTabRunStartHtml = (line: string) => /^<span class="tablatura">/.test(line) || /^\s*Parte \d+ [Dd]e \d+\s*$/.test(line);
    const extractTitleHtml = (line: string) =>
      line.match(/^(?:<span class="tablatura">)?<span class="section-title">([^<]*)<\/span>/)?.[1] ?? null;
    const rawHtmlWithTabHeaders = insertMissingTabHeaders(
      rawHtmlBuilt,
      (line) => /^(?:<span class="tablatura">)?<span class="section-title">/.test(line),
      extractTitleHtml,
      (title) => '<span class="section-title">' + title + "</span>",
      isTabRunStartHtml
    );
    rawHtml = normalizeHeaderBlankLines(
      dedupeAdjacentHeaders(rawHtmlWithTabHeaders, isSectionTitleLine, extractTitleHtml, isHtmlTabContinuation),
      isSectionTitleLine
    );
  }

  let title = "";
  let artist = "";

  const titleElement = document.querySelector("h1.t1");
  if (titleElement) {
    title = titleElement.textContent?.trim() || "";
  }

  // Regular pages put the artist in an anchor; print pages use a bare h2.
  const artistElement = document.querySelector("h2.t3 a");
  if (artistElement) {
    artist = artistElement.textContent?.trim() || "";
  } else {
    const artistHeading = document.querySelector("h2");
    if (artistHeading) {
      artist = artistHeading.textContent?.trim() || "";
    }
  }

  // Fall back to the page <title>. Regular pages: "Song - Artist - Cifra Club".
  if (!title || !artist) {
    const pageTitle = document.title;
    if (pageTitle) {
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, "").trim();
      const parts = cleanTitle.split(" - ");
      if (parts.length >= 2) {
        if (!title) title = parts.slice(0, -1).join(" - ").trim();
        if (!artist) artist = parts[parts.length - 1].trim();
      } else if (!title) {
        title = cleanTitle;
      }
    }
  }

  if (!artist) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      artist = pathSegments[0]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  if (!title) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      title = pathSegments[1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Song key: the chord-tone anchor button. Its text can carry a
  // capo-relative shape suffix, e.g. "F#m (com forma de Em)".
  let songKey = "";
  const keyElement = document.querySelector('[data-anchor="--chord-tone"]');
  if (keyElement) {
    const text = keyElement.textContent?.trim() || "";
    songKey = text.split(/\s+/)[0] || "";
  }

  // Capo: the capo info card's value paragraph ("Sem capotraste" has no digits).
  let guitarCapo = 0;
  const capoElement = document.querySelector('#capo span p');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || "";
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      guitarCapo = parseInt(capoMatch[1], 10);
    }
  }

  // Tuning: prefer an explicit "Afinação: <notes>" line in the content (exact,
  // as printed for this song). Otherwise read the tuning info card: "Padrão"
  // means standard, and a shift phrase like "1/2 tom abaixo" (half step down)
  // or "1 tom acima" (whole step up) is transposed from standard tuning.
  let guitarTuning: GuitarTuning = ["E", "A", "D", "G", "B", "E"];
  if (leadingTuningMatch) {
    const notes = leadingTuningMatch[1].trim().split(/\s+/).filter(Boolean);
    if (notes.length === 6) {
      guitarTuning = notes as unknown as GuitarTuning;
    }
  } else {
    const tuningCardText = document.querySelector('#tuning span p')?.textContent?.trim() || "";
    const shiftMatch = tuningCardText.match(/^(meio|\d+(?:\/\d+)?)\s*to(?:m|ns)\s*(abaixo|acima)$/i);
    if (shiftMatch) {
      const [, amountText, direction] = shiftMatch;
      const amount = amountText.toLowerCase() === "meio"
        ? 0.5
        : amountText.includes("/")
          ? Number(amountText.split("/")[0]) / Number(amountText.split("/")[1])
          : Number(amountText);
      const semitones = Math.round(amount * 2) * (direction.toLowerCase() === "abaixo" ? -1 : 1);
      if (semitones !== 0) {
        const NOTE_INDEX: Record<string, number> = {
          C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
          "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
        };
        const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
        const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const table = semitones < 0 ? FLATS : SHARPS;
        guitarTuning = guitarTuning.map((note) => {
          const idx = ((NOTE_INDEX[note] + semitones) % 12 + 12) % 12;
          return table[idx];
        }) as unknown as GuitarTuning;
      }
    }
  }

  return {
    songChords,
    ...(rawHtml ? { rawHtml } : {}),
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || "",
    artist: artist || "Unknown Artist",
  } as ChordSheet & SongMetadata;
}
