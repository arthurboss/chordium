import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { fetchJsonpDocs } from "./_jsonp.js";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artistPath } = req.query as Record<string, string>;

  if (!artistPath) {
    return res.status(400).json({ error: "Missing artistPath parameter" });
  }

  const escapedPath = artistPath.replace(/[%_]/g, "\\$&");

  // Check Neon first
  try {
    const { rows } = await sql`
      SELECT title, artist, path
      FROM songs
      WHERE path LIKE ${escapedPath + "/%"}
      ORDER BY title
    `;
    if (rows.length > 0) {
      // Update songCount in background if it differs
      sql`UPDATE artists SET "songCount" = ${rows.length} WHERE path = ${artistPath} AND ("songCount" IS NULL OR "songCount" != ${rows.length})`.catch(() => {});
      return res.json(rows);
    }
  } catch {
    // fall through
  }

  // Scrape /musicas.html with Puppeteer + @sparticuz/chromium
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
    await page.goto(`https://www.cifraclub.com.br/${artistPath}/musicas.html`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const songs = await page.evaluate((artistSlug: string) => {
      let artistName = "Unknown Artist";
      const titleMatch = document.title.match(/^(.+?)\s*\|\s/);
      if (titleMatch) artistName = titleMatch[1].trim();

      const results: { title: string; artist: string; path: string }[] = [];
      document.querySelectorAll("ol li a[href]").forEach((link) => {
        const href = (link as HTMLAnchorElement).getAttribute("href") || "";
        const pathMatch = href.match(/^\/(.+?)\/?$/);
        const path = pathMatch ? pathMatch[1] : "";
        if (!path) return;
        const segments = path.split("/").filter(Boolean);
        if (segments.length !== 2) return;
        if (segments[1].toLowerCase() === "letra") return;
        if (/^\d+$/.test(segments[1])) return;

        const titleEl = link.querySelector("p[class*='primaryLabel']");
        let title = titleEl?.textContent?.trim() || "";
        if (!title) {
          title = segments[1].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
        results.push({ title, artist: artistName, path });
      });
      return results;
    }, artistPath);

    if (songs.length > 0) {
      // Seed Neon in background — songs + update artist songCount
      Promise.all([
        ...songs.map((s) =>
          sql`INSERT INTO songs (title, artist, path) VALUES (${s.title}, ${s.artist}, ${s.path}) ON CONFLICT (path) DO NOTHING`.catch(() => {})
        ),
        sql`UPDATE artists SET "songCount" = ${songs.length} WHERE path = ${artistPath}`.catch(() => {}),
      ]).catch(() => {});
      return res.json(songs);
    }
  } catch {
    // fall through to JSONP
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  // JSONP fallback — limited to ~5 songs
  try {
    const docs = await fetchJsonpDocs(artistPath.replace(/-/g, " "));
    const songs = docs
      .filter((d) => d.t === "2" && d.d === artistPath && d.u)
      .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }));

    if (songs.length > 0) {
      Promise.all(
        songs.map((s) =>
          sql`INSERT INTO songs (title, artist, path) VALUES (${s.title}, ${s.artist}, ${s.path}) ON CONFLICT (path) DO NOTHING`.catch(() => {})
        )
      ).catch(() => {});
    }

    return res.json(songs);
  } catch (e) {
    return res.status(502).json({ error: "Failed to fetch artist songs", details: (e as Error).message });
  }
}
