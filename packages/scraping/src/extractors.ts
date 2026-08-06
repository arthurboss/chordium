import type { ChordSheet, SongMetadata, GuitarTuning } from "@chordium/types";

/**
 * Extracts a full chord sheet (content + metadata) from a CifraClub page.
 *
 * IMPORTANT: this function body is serialized and executed inside the browser
 * via `page.evaluate`, so it may only reference the DOM and its own locals — no
 * imports, closures, or Node APIs. Types are erased at compile time.
 *
 * Returns both plain-text `songChords` and `rawHtml` that preserves the
 * source's own `<b>` chord markup. The frontend renders `rawHtml` directly, so
 * chord highlighting comes from the source (which already marks every chord)
 * rather than a client-side regex that can never enumerate every chord shape.
 *
 * Works on both regular song pages and print pages (`imprimir.html`), which
 * render some metadata differently (bare text / bare h2 instead of anchors).
 */
export function extractFullChordSheet(): ChordSheet & SongMetadata {
  const preElement = document.querySelector("pre");
  let songChords = "";
  let rawHtml: string | undefined;

  if (preElement) {
    // Plain-text content in ChordPro format: chords wrapped in source <b>
    // tags become inline [Chord] brackets, span.tablatura tab blocks become
    // {start_of_tab}/{end_of_tab} directives, and bare "[Section]" text nodes
    // (optionally followed by trailing chords on the same source line, e.g.
    // "[Intro] Em7  G") become {comment: Section} directives.
    function nodeToChordPro(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const el = node as Element;
      if (el.classList.contains("tablatura")) {
        // A bare "[Label]" line (e.g. "[Tab - Solo]") sometimes precedes the
        // actual string lines inside the source's tablature text -- hoist
        // it out as a ChordPro comment directive ahead of the tab block
        // instead of leaving it as inert text inside {start_of_tab}, since
        // ChordPro directives aren't recognized inside a tab environment.
        const tabText = el.textContent || "";
        const tabLines = tabText.split("\n");
        const labelLines: string[] = [];
        let i = 0;
        while (i < tabLines.length) {
          const trimmed = tabLines[i].trim();
          const labelMatch = trimmed.match(/^\[([^\]]+)\]$/);
          if (labelMatch) {
            labelLines.push("{comment: " + labelMatch[1] + "}");
            i++;
            continue;
          }
          if (trimmed === "" && labelLines.length > 0 && i < tabLines.length - 1) {
            i++;
            continue;
          }
          break;
        }
        const labelPrefix = labelLines.length > 0 ? labelLines.join("\n") + "\n" : "";
        const remainingTabText = tabLines.slice(i).join("\n");
        return labelPrefix + "{start_of_tab}\n" + remainingTabText + "\n{end_of_tab}\n";
      }
      if (el.tagName.toLowerCase() === "b") {
        // Sentinel-prefixed so the line-level pass below can tell a
        // chord-origin bracket apart from a bare "[Section]" text node even
        // when the bracket is the only content on its line (e.g. an
        // instrumental line with a single chord).
        return "\u0000[" + (el.textContent || "").trim() + "]";
      }
      return Array.from(el.childNodes).map(nodeToChordPro).join("");
    }

    let assembled = "";
    preElement.childNodes.forEach(function (node) {
      assembled += nodeToChordPro(node);
    });

    // A line that is *only* "[Section Name]" (bare bracket, optionally
    // followed by trailing content such as chords on the same line) is a
    // section header in the source markup, not a chord -- convert the label
    // to a ChordPro comment directive, splitting any trailing content onto
    // its own line. Lines inside a tab block are left untouched since tab
    // content is whitespace-significant.
    let insideTab = false;
    songChords = assembled
      .split("\n")
      .map(function (line) {
        const trimmed = line.trim();
        if (trimmed === "{start_of_tab}") {
          insideTab = true;
          return line;
        }
        if (trimmed === "{end_of_tab}") {
          insideTab = false;
          return line;
        }
        if (!insideTab) {
          const sectionMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)$/);
          if (sectionMatch) {
            const rest = sectionMatch[2];
            return rest ? "{comment: " + sectionMatch[1] + "}\n" + rest : "{comment: " + sectionMatch[1] + "}";
          }
        }
        return line;
      })
      .join("\n")
      .split("\u0000")
      .join("");

    // Third pass: a chord-only line (after the wrap pass, stripping every
    // [chord] bracket leaves only whitespace) is still on its own line here,
    // mirroring the source's positional layout -- not real ChordPro. Merge
    // it into the following lyric line, snapping each chord's source column
    // to the start of the nearest word so brackets never land mid-word.
    const CHORD_BRACKET_RE = /\[([^\]]+)\]/g;

    function isChordOnlyLine(line: string): boolean {
      if (line.trim() === "") return false;
      CHORD_BRACKET_RE.lastIndex = 0;
      if (!CHORD_BRACKET_RE.test(line)) return false;
      CHORD_BRACKET_RE.lastIndex = 0;
      const stripped = line.replace(CHORD_BRACKET_RE, "");
      return stripped.trim() === "";
    }

    function extractChordTokensWithColumns(line: string): { col: number; chord: string }[] {
      // `line` already has its chords wrapped as "[Chord]" by the earlier
      // wrap pass, which shifts each subsequent chord's bracket position
      // rightward relative to the ORIGINAL source layout (every "[" "]"
      // pair adds 2 characters that weren't in the source's plain-text
      // spacing). The lyric line below was never bracket-wrapped, so its
      // column scale still matches the original layout -- recover that
      // same scale here by stripping brackets back out before tokenizing,
      // which restores the exact original whitespace run lengths.
      const debracketed = line.replace(/[[\]]/g, "");
      const tokens: { col: number; chord: string }[] = [];
      const re = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(debracketed)) !== null) {
        tokens.push({ col: m.index, chord: m[0] });
      }
      return tokens;
    }

    function findWords(line: string): { start: number; end: number }[] {
      const words: { start: number; end: number }[] = [];
      const re = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        words.push({ start: m.index, end: m.index + m[0].length });
      }
      return words;
    }

    function snapColumnToWordStart(col: number, words: { start: number; end: number }[]): number {
      for (const word of words) {
        if (col < word.end) return word.start;
      }
      return words.length > 0 ? words[words.length - 1].end : 0;
    }

    function insertChordsAtColumns(lyricLine: string, tokens: { col: number; chord: string }[]): string {
      const sorted = tokens.slice().sort((a, b) => a.col - b.col);
      const words = findWords(lyricLine);
      let result = "";
      let lastPos = 0;
      for (const t of sorted) {
        const insertPos = Math.max(snapColumnToWordStart(t.col, words), lastPos);
        result += lyricLine.slice(lastPos, insertPos);
        result += "[" + t.chord + "]";
        lastPos = insertPos;
      }
      result += lyricLine.slice(lastPos);
      return result;
    }

    const DIRECTIVE_RE = /^\{[a-zA-Z_]+(?::[^}]*)?\}$/;
    const reflowedLines: string[] = [];
    const linesForReflow = songChords.split("\n");
    let insideTabReflow = false;
    let idx = 0;
    while (idx < linesForReflow.length) {
      const line = linesForReflow[idx];
      const trimmed = line.trim();
      if (trimmed === "{start_of_tab}") {
        insideTabReflow = true;
        reflowedLines.push(line);
        idx++;
        continue;
      }
      if (trimmed === "{end_of_tab}") {
        insideTabReflow = false;
        reflowedLines.push(line);
        idx++;
        continue;
      }
      if (!insideTabReflow && isChordOnlyLine(line)) {
        const next = linesForReflow[idx + 1];
        const nextTrimmed = next !== undefined ? next.trim() : undefined;
        const nextIsLyricLine =
          next !== undefined &&
          nextTrimmed !== "" &&
          !DIRECTIVE_RE.test(nextTrimmed as string) &&
          !isChordOnlyLine(next);
        if (nextIsLyricLine) {
          const tokens = extractChordTokensWithColumns(line);
          reflowedLines.push(insertChordsAtColumns(next as string, tokens));
          idx += 2;
          continue;
        }
      }
      reflowedLines.push(line);
      idx++;
    }
    songChords = reflowedLines.join("\n");

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

    let rawHtmlRaw = Array.from(preElement.childNodes).map(sanitizeNode).join("");
    // Some tab blocks close the tablatura span before the last string, leaving
    // the 6th string (e.g. "E|----|") as a bare line after </span></span>.
    // Absorb those trailing tab-string lines back inside the cnt span so the
    // whole tab block renders together.
    rawHtmlRaw = rawHtmlRaw.replace(
      /(<\/span>)(<\/span>)((?:\n[ \t]*[EADGBe]\|[-\d][^\n]*)+)/g,
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
    rawHtml = result
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

  // Song key: regular pages use an anchor; print pages render bare "tom: Bm".
  let songKey = "";
  const keyAnchor = document.querySelector("span#cifra_tom a");
  if (keyAnchor) {
    songKey = keyAnchor.textContent?.trim() || "";
  } else {
    const keySpan = document.querySelector("span#cifra_tom");
    if (keySpan) {
      songKey = (keySpan.textContent || "").replace(/tom\s*:/i, "").trim();
    }
  }

  let guitarCapo = 0;
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || "";
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      guitarCapo = parseInt(capoMatch[1], 10);
    }
  }

  // Tuning: `span#cifra_afi a` is only present when non-standard; absent = standard.
  let guitarTuning: GuitarTuning = ["E", "A", "D", "G", "B", "E"];
  const tuningElement = document.querySelector("span#cifra_afi a");
  if (tuningElement) {
    const notes = (tuningElement.textContent || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (notes.length === 6) {
      guitarTuning = notes as unknown as GuitarTuning;
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
