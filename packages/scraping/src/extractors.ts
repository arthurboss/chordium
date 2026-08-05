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
    // Plain-text content (tab blocks wrapped in [TAB] markers).
    preElement.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        songChords += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.classList.contains("tablatura")) {
          songChords += "[TAB]\n" + (el.textContent || "") + "\n[/TAB]\n";
        } else {
          songChords += el.textContent || "";
        }
      }
    });

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
