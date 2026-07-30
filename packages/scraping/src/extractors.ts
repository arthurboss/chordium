import type { ChordSheet, SongMetadata, GuitarTuning } from "@chordium/types";

/**
 * Extracts a full chord sheet (content + metadata) from a CifraClub page.
 *
 * IMPORTANT: this function body is serialized and executed inside the browser
 * via `page.evaluate`, so it may only reference the DOM and its own locals — no
 * imports, closures, or Node APIs. Types are erased at compile time.
 *
 * Works on both regular song pages and print pages (`imprimir.html`), which
 * render some metadata differently (bare text / bare h2 instead of anchors).
 */
export function extractFullChordSheet(): ChordSheet & SongMetadata {
  const preElement = document.querySelector("pre");
  let songChords = "";
  if (preElement) {
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
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || "",
    artist: artist || "Unknown Artist",
  } as ChordSheet & SongMetadata;
}
