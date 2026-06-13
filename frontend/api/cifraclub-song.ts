import type { VercelRequest, VercelResponse } from "@vercel/node";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url: pathParam, lyricsOnly } = req.query as Record<string, string>;

  if (!pathParam) {
    return res.status(400).json({ error: "Missing song path parameter" });
  }

  const parts = pathParam.trim().split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return res.status(400).json({ error: "Invalid path format, expected artist/song" });
  }

  const songUrl = `https://www.cifraclub.com.br/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}/`;
  const letraUrl = `${songUrl}letra/`;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Always fetch metadata from the song page
    await page.goto(songUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    const metadata = await page.evaluate(() => {
      const title = document.querySelector("h1.t1")?.textContent?.trim() || "";
      const artist = document.querySelector("h2.t3 a")?.textContent?.trim() || "Unknown Artist";
      const songKey = document.querySelector("span#cifra_tom a")?.textContent?.trim() || "";
      const capoText = document.querySelector("span[data-cy='song-capo'] a")?.textContent?.trim() || "";
      const capoMatch = capoText.match(/(\d+)/);
      const guitarCapo = capoMatch ? parseInt(capoMatch[1], 10) : 0;
      return { title, artist, songKey, guitarCapo, guitarTuning: ["E", "A", "D", "G", "B", "E"] as ["E","A","D","G","B","E"] };
    });

    // Fetch content from the appropriate URL
    let songChords = "";
    let rawHtml: string | undefined;

    if (lyricsOnly === 'true') {
      await page.goto(letraUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      songChords = await page.evaluate(() => {
        const el = document.querySelector("div.letra-l");
        if (!el) return "";
        const verses = Array.from(el.querySelectorAll("p")).map(function(p) {
          return Array.from(p.querySelectorAll("span.l_row"))
            .map(function(row) { return (row.textContent || "").trim(); })
            .filter(function(line) { return line.length > 0; })
            .join("\n");
        }).filter(function(v) { return v.length > 0; });
        return verses.join("\n\n");
      });
    } else {
      const result = await page.evaluate(() => {
        const el = document.querySelector("pre");
        if (!el) return { songChords: "", rawHtml: "" };

        let chords = "";
        el.childNodes.forEach(function(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            chords += node.textContent || "";
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const child = node as Element;
            if (child.classList.contains("tablatura")) {
              chords += "[TAB]\n" + (child.textContent || "") + "\n[/TAB]\n";
            } else {
              chords += child.textContent || "";
            }
          }
        });

        // Sanitize: keep only text nodes, <b>, and <span> elements — strip all attributes
        // except class on span (used by CifraClub to style chord names).
        function sanitizeNode(node: Node): string {
          if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
          if (node.nodeType !== Node.ELEMENT_NODE) return "";
          const el = node as Element;
          const tag = el.tagName.toLowerCase();
          if (tag !== "b" && tag !== "span") {
            // For other elements just recurse into children
            return Array.from(el.childNodes).map(sanitizeNode).join("");
          }
          const classAttr = el.getAttribute("class");
          const openTag = classAttr ? `<${tag} class="${classAttr.replace(/"/g, "&quot;")}">` : `<${tag}>`;
          const inner = Array.from(el.childNodes).map(sanitizeNode).join("");
          return `${openTag}${inner}</${tag}>`;
        }

        const sanitized = Array.from(el.childNodes).map(sanitizeNode).join("");
        return { songChords: chords, rawHtml: sanitized };
      });

      songChords = result.songChords;
      rawHtml = result.rawHtml || undefined;
    }

    if (!songChords) {
      return res.status(404).json({ error: "Content not found" });
    }

    return res.json({ ...metadata, songChords, ...(rawHtml ? { rawHtml } : {}) });
  } catch (e) {
    return res.status(502).json({ error: "Failed to fetch song", details: (e as Error).message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
