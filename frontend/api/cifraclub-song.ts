import type { VercelRequest, VercelResponse } from "@vercel/node";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url: pathParam } = req.query as Record<string, string>;

  if (!pathParam) {
    return res.status(400).json({ error: "Missing song path parameter" });
  }

  const parts = pathParam.trim().split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return res.status(400).json({ error: "Invalid path format, expected artist/song" });
  }

  const url = `https://www.cifraclub.com.br/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}/`;

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
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const result = await page.evaluate(() => {
      const pre = document.querySelector("pre");
      const songChords = pre ? pre.textContent || "" : "";

      const title = document.querySelector("h1.t1")?.textContent?.trim() || "";
      const artist = document.querySelector("h2.t3 a")?.textContent?.trim() || "Unknown Artist";
      const songKey = document.querySelector("span#cifra_tom a")?.textContent?.trim() || "";
      const capoText = document.querySelector("span[data-cy='song-capo'] a")?.textContent?.trim() || "";
      const capoMatch = capoText.match(/(\d+)/);
      const guitarCapo = capoMatch ? parseInt(capoMatch[1], 10) : 0;

      return {
        songChords,
        title,
        artist,
        songKey,
        guitarCapo,
        guitarTuning: ["E", "A", "D", "G", "B", "E"] as ["E","A","D","G","B","E"],
      };
    });

    if (!result.songChords) {
      return res.status(404).json({ error: "Chord sheet content not found" });
    }

    return res.json(result);
  } catch (e) {
    return res.status(502).json({ error: "Failed to fetch song", details: (e as Error).message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
