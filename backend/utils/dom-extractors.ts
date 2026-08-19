/**
 * DOM extraction utilities for CifraClub pages
 * These functions run in the browser context via Puppeteer's page.evaluate()
 */

import type { Song, ChordSheet, SongMetadata, GuitarTuning } from "../../shared/types/index.js";

/**
 * Search result from DOM extraction
 */
import type { DOMSearchResult } from "../types/dom.types.js";

/**
 * Extracts search results from CifraClub search page DOM
 */
export function extractSearchResults(): DOMSearchResult[] {
  const links = Array.from(document.querySelectorAll(".gsc-result a"));
  return links
    .filter((link) => {
      const parent = link.parentElement;
      return parent && parent.className === "gs-title";
    })
    .map((link) => {
      const url = (link as HTMLAnchorElement).href.startsWith("http")
        ? (link as HTMLAnchorElement).href
        : `${window.location.origin}${(link as HTMLAnchorElement).href}`;
      // Extract path from URL (e.g., "https://www.cifraclub.com.br/oasis/wonderwall/" -> "oasis/wonderwall")
      const pathMatch = url.match(/cifraclub\.com\.br\/(.+?)\/?$/);
      const path = pathMatch ? pathMatch[1] : url;

      const rawTitle = link.textContent?.trim() || "";

      // Extract artist information from title or URL
      let artist = "";
      let title = rawTitle;

      // First try to extract from title (format: "Song Title - Artist Name - Cifra Club" or "Artist Name - Cifra Club")
      if (rawTitle.includes(" - ")) {
        // Remove "- Cifra Club" suffix first
        const cleanTitle = rawTitle.replace(/ - Cifra Club$/, "").trim();

        // Split by " - " to separate song and artist
        const parts = cleanTitle.split(" - ");
        if (parts.length >= 2) {
          // Format: "Song Title - Artist Name"
          title = parts.slice(0, -1).join(" - ").trim();
          artist = parts[parts.length - 1].trim();
        } else if (parts.length === 1) {
          // Format: "Artist Name - Cifra Club" (artist-only page)
          title = cleanTitle;
          // For artist-only pages, set artist same as title
          const pathSegments = path.split("/").filter(Boolean);
          if (pathSegments.length === 1) {
            // This is an artist page, not a song page
            artist = cleanTitle;
          }
        }
      }

      // Fallback: extract artist from URL if not found in title
      if (!artist) {
        const pathSegments = path.split("/").filter(Boolean);
        if (pathSegments.length >= 2) {
          // For song URLs like "oasis/wonderwall", artist is first segment
          artist = pathSegments[0]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        } else if (pathSegments.length === 1) {
          // For artist URLs like "oasis", artist is the single segment
          artist = pathSegments[0]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }

      return {
        title,
        path,
        artist: artist || "",
      };
    })
    .filter((r) => {
      if (!r.title || !r.path) return false;
      const segments = r.path.split("/").filter(Boolean);
      // Allow 1 segment (artist page) or 2 segments (song page)
      if (segments.length !== 1 && segments.length !== 2) return false;
      // For 2-segment paths, exclude if last segment is "letra"
      if (segments.length === 2 && segments[1].toLowerCase() === "letra")
        return false;
      // For 2-segment paths, exclude if second segment is numeric (e.g., /artist/12345)
      if (segments.length === 2 && /^\d+$/.test(segments[1])) return false;
      return true;
    });
}

/**
 * Extracts artist songs from CifraClub artist page DOM
 */
export function extractArtistSongs(): Song[] {
  // Extract artist name from the artist link element (h2.t3 a), which is always
  // present on the artist page and already used elsewhere for this purpose (see
  // extractChordSheetMeta below and cifraclub-song.ts). More reliable than the
  // page title, whose format varies between song pages ("Artist - Cifra Club")
  // and the /musicas.html listing page ("Artist | Todas as músicas").
  let artistName = "Unknown Artist";
  const artistElement = document.querySelector("h2.t3 a");
  if (artistElement) {
    artistName = artistElement.textContent?.trim() || "Unknown Artist";
  }
  if (artistName === "Unknown Artist") {
    const pageTitle = document.title;
    if (pageTitle) {
      const titleMatch = pageTitle.match(/^(.+?)\s*(?:\||-)\s*(?:Todas as m|Cifra Club)/i);
      if (titleMatch) {
        artistName = titleMatch[1].trim();
      }
    }
  }
  if (artistName === "Unknown Artist") {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      artistName = pathSegments[0]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  const songs: Song[] = [];

  // /musicas.html page: songs are in ol > li > a[href]
  document.querySelectorAll("ol li a[href]").forEach((link) => {
    try {
      const href = (link as HTMLAnchorElement).getAttribute("href") || "";
      if (!href) return;

      // Extract path from href (e.g., "/oasis/wonderwall/" -> "oasis/wonderwall")
      const pathMatch = href.match(/^\/(.+?)\/?$/);
      const path = pathMatch ? pathMatch[1] : "";
      if (!path) return;

      const segments = path.split("/").filter(Boolean);
      if (segments.length !== 2) return;
      if (segments[1].toLowerCase() === "letra") return;
      if (/^\d+$/.test(segments[1])) return;

      // Try to get title from the primaryLabel paragraph inside the link
      const titleEl = link.querySelector("p[class*='primaryLabel']");
      let title = titleEl?.textContent?.trim() || "";

      // Fallback: convert slug to title
      if (!title) {
        title = segments[1]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }

      songs.push({ title, path, artist: artistName });
    } catch (e) {
      // skip malformed entries
    }
  });

  return songs;
}

export function extractFullChordSheet(): ChordSheet & SongMetadata {
  const preElement = document.querySelector("pre");
  let songChords = "";
  if (preElement) {
    preElement.childNodes.forEach(function(node) {
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

  // Extract title and artist from page
  let title = "";
  let artist = "";

  // For chord sheet pages, try to get title from h1.t1 first (CifraClub specific)
  const titleElement = document.querySelector("h1.t1");
  if (titleElement) {
    title = titleElement.textContent?.trim() || "";
  }

  // For chord sheet pages, try to get artist from h2.t3 a first (CifraClub specific)
  const artistElement = document.querySelector("h2.t3 a");
  if (artistElement) {
    artist = artistElement.textContent?.trim() || "";
  } else {
    // Print pages (imprimir.html) render the artist in a bare h2 with no anchor.
    const artistHeading = document.querySelector("h2");
    if (artistHeading) {
      artist = artistHeading.textContent?.trim() || "";
    }
  }

  // Try to get title and artist from page title (format: "Song Title - Artist Name - Cifra Club")
  // Only use this if we didn't find title from h1.t1 or artist from h2.t3 a
  if (!title || !artist) {
    const pageTitle = document.title;
    if (pageTitle) {
      // Remove "- Cifra Club" suffix first
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, "").trim();

      // Split by " - " to separate song and artist
      const parts = cleanTitle.split(" - ");
      if (parts.length >= 2) {
        // Format: "Song Title - Artist Name"
        if (!title) {
          title = parts.slice(0, -1).join(" - ").trim();
        }
        if (!artist) {
          artist = parts[parts.length - 1].trim();
        }
      } else if (!title) {
        title = cleanTitle;
      }
    }
  }

  // Fallback: extract artist from URL if not found in title
  if (!artist) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", artist is first segment
      artist = pathSegments[0]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Extract song title from URL if not found in page title
  if (!title) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", song is second segment
      title = pathSegments[1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Extract key, tuning, and capo information
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  let songKey = "";
  const keyAnchor = document.querySelector("span#cifra_tom a");
  if (keyAnchor) {
    songKey = keyAnchor.textContent?.trim() || "";
  } else {
    // Print pages render the key as bare text (e.g. "tom: Bm") with no anchor.
    const keySpan = document.querySelector("span#cifra_tom");
    if (keySpan) {
      songKey = (keySpan.textContent || "").replace(/tom\s*:/i, "").trim();
    }
  }

  // Extract capo position from span[data-cy="song-capo"] a element (CifraClub specific)
  let guitarCapo = 0;
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || "";
    // Extract number from text like "1ª casa", "2ª casa", etc.
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      guitarCapo = parseInt(capoMatch[1], 10);
    }
  }

  // Extract tuning from span#cifra_afi a element (CifraClub specific).
  // The element is only present when the tuning is non-standard; when it is
  // absent we fall back to standard tuning.
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

/**
 * Extracts song key from CifraClub page DOM
 */
export function extractSongKey(): string {
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  const keyAnchor = document.querySelector("span#cifra_tom a");
  if (keyAnchor) {
    return keyAnchor.textContent?.trim() || "";
  }
  // Print pages render the key as bare text (e.g. "tom: Bm") with no anchor.
  const keySpan = document.querySelector("span#cifra_tom");
  if (keySpan) {
    return (keySpan.textContent || "").replace(/tom\s*:/i, "").trim();
  }

  return "";
}

/**
 * Extracts guitar capo position from CifraClub page DOM
 */
export function extractGuitarCapo(): number {
  // Extract capo position from span[data-cy="song-capo"] a element (CifraClub specific)
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || "";
    // Extract number from text like "1ª casa", "2ª casa", etc.
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      return parseInt(capoMatch[1], 10);
    }
  }

  return 0;
}

/**
 * Extracts song metadata from CifraClub song page DOM (fast, no pre element reading)
 * This function extracts only metadata without reading the heavy chord content
 */
export function extractSongMetadata(): SongMetadata {
  // Extract title and artist from page
  let title = "";
  let artist = "";

  // For chord sheet pages, try to get title from h1.t1 first (CifraClub specific)
  const titleElement = document.querySelector("h1.t1");
  if (titleElement) {
    title = titleElement.textContent?.trim() || "";
  }

  // For chord sheet pages, try to get artist from h2.t3 a first (CifraClub specific)
  const artistElement = document.querySelector("h2.t3 a");
  if (artistElement) {
    artist = artistElement.textContent?.trim() || "";
  } else {
    // Print pages (imprimir.html) render the artist in a bare h2 with no anchor.
    const artistHeading = document.querySelector("h2");
    if (artistHeading) {
      artist = artistHeading.textContent?.trim() || "";
    }
  }

  // Try to get title and artist from page title (format: "Song Title - Artist Name - Cifra Club")
  // Only use this if we didn't find title from h1.t1 or artist from h2.t3 a
  if (!title || !artist) {
    const pageTitle = document.title;
    if (pageTitle) {
      // Remove "- Cifra Club" suffix first
      const cleanTitle = pageTitle.replace(/ - Cifra Club$/, "").trim();

      // Split by " - " to separate song and artist
      const parts = cleanTitle.split(" - ");
      if (parts.length >= 2) {
        // Format: "Song Title - Artist Name"
        if (!title) {
          title = parts.slice(0, -1).join(" - ").trim();
        }
        if (!artist) {
          artist = parts[parts.length - 1].trim();
        }
      } else if (!title) {
        title = cleanTitle;
      }
    }
  }

  // Fallback: extract artist from URL if not found in title
  if (!artist) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", artist is first segment
      artist = pathSegments[0]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Extract song title from URL if not found in page title
  if (!title) {
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) {
      // For song URLs like "/oasis/wonderwall/", song is second segment
      title = pathSegments[1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Extract key, tuning, and capo information
  // Extract song key from span#cifra_tom a element (CifraClub specific)
  let songKey = "";
  const keyAnchor = document.querySelector("span#cifra_tom a");
  if (keyAnchor) {
    songKey = keyAnchor.textContent?.trim() || "";
  } else {
    // Print pages render the key as bare text (e.g. "tom: Bm") with no anchor.
    const keySpan = document.querySelector("span#cifra_tom");
    if (keySpan) {
      songKey = (keySpan.textContent || "").replace(/tom\s*:/i, "").trim();
    }
  }

  // Extract capo position from span[data-cy="song-capo"] a element (CifraClub specific)
  let guitarCapo = 0;
  const capoElement = document.querySelector('span[data-cy="song-capo"] a');
  if (capoElement) {
    const capoText = capoElement.textContent?.trim() || "";
    // Extract number from text like "1ª casa", "2ª casa", etc.
    const capoMatch = capoText.match(/(\d+)/);
    if (capoMatch) {
      guitarCapo = parseInt(capoMatch[1], 10);
    }
  }

  // Extract tuning from span#cifra_afi a element (CifraClub specific).
  // The element is only present when the tuning is non-standard; when it is
  // absent we fall back to standard tuning.
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
  } else {
    // Some pages render non-standard tuning as a plain "Afinação: <notes>"
    // line at the very start of the pre block instead of a cifra_afi anchor.
    const preElement = document.querySelector("pre");
    const preText = preElement?.textContent || "";
    const leadingTuningMatch = preText.match(/^Afinação:\s*([A-G][#b]?(?:\s+[A-G][#b]?){5})\s*\n+/i);
    if (leadingTuningMatch) {
      const notes = leadingTuningMatch[1].trim().split(/\s+/).filter(Boolean);
      if (notes.length === 6) {
        guitarTuning = notes as unknown as GuitarTuning;
      }
    }
  }

  return {
    songKey,
    guitarTuning,
    guitarCapo,
    title: title || "",
    artist: artist || "Unknown Artist",
  };
}

/**
 * Extracts chord sheet from CifraClub song page DOM (content only)
 * Extracts chord sheet content from the pre element.
 * Tab blocks (span.tablatura) are wrapped with [TAB]/[/TAB] markers
 * so the parser can identify them without heuristics.
 */
export function extractChordSheet(): ChordSheet {
  const preElement = document.querySelector("pre");
  if (!preElement) return { songChords: "" };

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

  let songChords = "";
  // Tab blocks are plain text too (their dash-drawn strings, e.g.
  // "E|----7-10-...|", are already self-identifying), so no wrapper markers
  // are needed — bracket-style markers would collide with the "[Section]"
  // convention used elsewhere and render as bogus section headers when
  // rawHtml is unavailable.
  preElement.childNodes.forEach(function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      songChords += node.textContent || "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      songChords += (node as Element).textContent || "";
    }
  });

  // Some pages render non-standard tuning as a plain "Afinação: <notes>" line
  // at the very start of the pre block instead of a cifra_afi anchor. Strip
  // it so it doesn't leak into the chord sheet body as a lyric line.
  const leadingTuningLineRegex = /^Afinação:\s*(?:[A-G][#b]?\s*){6}\s*\n+/i;
  songChords = songChords.replace(leadingTuningLineRegex, "");
  const isBareBracketHeader = (line: string) => /^\[[^\]]+\]$/.test(line);
  songChords = dedupeAdjacentHeaders(songChords, isBareBracketHeader);
  songChords = normalizeHeaderBlankLines(songChords, isBareBracketHeader);

  function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag !== "b" && tag !== "span") {
      return Array.from(el.childNodes).map(sanitizeNode).join("");
    }
    const classAttr = el.getAttribute("class");
    const openTag = classAttr ? `<${tag} class="${classAttr.replace(/"/g, "&quot;")}">` : `<${tag}>`;
    const inner = Array.from(el.childNodes).map(sanitizeNode).join("");
    return `${openTag}${inner}</${tag}>`;
  }

  let rawHtmlRaw = Array.from(preElement.childNodes).map(sanitizeNode).join("");
  // Same leading line as above, verbatim (it's a plain text node, not
  // wrapped in <b>/<span>, so it appears unchanged in the sanitized HTML).
  rawHtmlRaw = rawHtmlRaw.replace(leadingTuningLineRegex, "");
  // Wrap [Section Title] patterns in a span for styling
  // Wrap section titles and dedent continuation lines
  const rawHtml = (() => {
    const lines = rawHtmlRaw.split('\n');
    const result: string[] = [];
    let dedentAmount = 0;
    for (let i = 0; i < lines.length; i++) {
      const sectionMatch = lines[i].match(/^(<span class="tablatura">)?(\[(?:[^\]]+)\])\s?(.*)/);
      if (sectionMatch) {
        const prefix = sectionMatch[1] || '';
        result.push(prefix + '<span class="section-title">' + sectionMatch[2].slice(1, -1) + '</span>');
        dedentAmount = sectionMatch[2].length + 1;
        if (sectionMatch[3]) result.push(sectionMatch[3]);
      } else if (dedentAmount > 0 && lines[i].startsWith(' '.repeat(dedentAmount))) {
        result.push(lines[i].slice(dedentAmount));
      } else {
        if (lines[i] === '') dedentAmount = 0;
        result.push(lines[i]);
      }
    }
    const joined = result.join('\n');
    // Normalize spacing: 1 blank line before section titles, 0 after
    return joined
      .replace(/\n{2,}(<span class="section-title">)/g, '\n\n$1')
      .replace(/(<\/span>)\n\n+/g, '$1\n')
      .replace(/(<span class="tablatura">)((?:(?!<span class="cnt">)[\s\S])*?)(<span class="cnt">)/g, (_m: string, open: string, content: string, cnt: string) => {
        const lines = content.split('\n');
        const tabInfoLines: string[] = [];
        const chordAnnotationLines: string[] = [];
        for (const line of lines) {
          if (line.includes('<b>') && !line.includes('<span class="section-title">')) {
            chordAnnotationLines.push(line);
          } else if (line.trim() && !line.includes('<span class="section-title">')) {
            tabInfoLines.push('<span class="tab-info">' + line + '</span>');
          } else {
            tabInfoLines.push(line);
          }
        }
        // Chord annotation lines belong inside cnt so tab-splitting can position them correctly
        const prefix = chordAnnotationLines.length > 0 ? chordAnnotationLines.join('\n') + '\n' : '';
        return open + tabInfoLines.join('\n') + cnt + prefix;
      });
  })();

  const isSectionTitleLine = (line: string) => /^<span class="section-title">.*<\/span>$/.test(line);
  return { songChords, rawHtml: normalizeHeaderBlankLines(dedupeAdjacentHeaders(rawHtml, isSectionTitleLine), isSectionTitleLine) };
}

/**
 * Extracts lyrics-only content from a /letra/ page DOM.
 * Targets div.letra-l (lyrics only, skipping div.letra-t which is the translation).
 * Joins <p> tags with newlines to preserve verse/section formatting.
 */
/**
 * Extracts lyrics-only content from a /letra/ page DOM.
 * Structure: div.letra-l > p > span.l_row (lines) separated by <br>.
 * Each p becomes a verse (newline-separated lines), verses separated by blank lines.
 */
export function extractLyricsContent(): ChordSheet {
  const el = document.querySelector("div.letra-l");
  if (!el) return { songChords: "" };
  const verses = Array.from(el.querySelectorAll("p")).map(function(p) {
    return Array.from(p.querySelectorAll("span.l_row"))
      .map(function(row) { return (row.textContent || "").trim(); })
      .filter(function(line) { return line.length > 0; })
      .join("\n");
  }).filter(function(v) { return v.length > 0; });
  return { songChords: verses.join("\n\n") };
}
