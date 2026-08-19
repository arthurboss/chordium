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
 * Print pages also paginate long songs across multiple `<pre>` elements (one
 * per printed page) — every `<pre>` on the page is read and concatenated, since
 * reading only the first silently drops the rest of the song.
 */
export function extractFullChordSheet(): ChordSheet & SongMetadata {
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
  // blank lines) by another one — the source sometimes repeats a section's
  // title right before its "Tab - <title>" counterpart with nothing of
  // substance in between, which reads as a useless duplicate header. Only
  // touches lines when a genuine duplicate is found — otherwise every line,
  // including any surrounding blank ones, is left exactly as it was.
  function dedupeAdjacentHeaders(text: string, isHeaderLine: (line: string) => boolean): string {
    const lines = text.split("\n");
    const result: string[] = [];
    for (const line of lines) {
      if (isHeaderLine(line.trim())) {
        let j = result.length - 1;
        while (j >= 0 && result[j].trim() === "") j--;
        if (j >= 0 && isHeaderLine(result[j].trim())) {
          result.length = j;
        }
      }
      result.push(line);
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
    const isBareBracketHeader = (line: string) => /^\[[^\]]+\]$/.test(line);
    songChords = dedupeAdjacentHeaders(songChords, isBareBracketHeader);
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
    const isSectionTitleLine = (line: string) => /^<span class="section-title">.*<\/span>$/.test(line);
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
    rawHtml = normalizeHeaderBlankLines(dedupeAdjacentHeaders(rawHtmlBuilt, isSectionTitleLine), isSectionTitleLine);
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
  } else if (leadingTuningMatch) {
    const notes = leadingTuningMatch[1].trim().split(/\s+/).filter(Boolean);
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
