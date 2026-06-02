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

    const chordSheet = await page.evaluate(() => {
      const pre = document.querySelector("pre");
      return { songChords: pre ? pre.textContent || "" : "" };
    });

    if (!chordSheet.songChords) {
      return res.status(404).json({ error: "Chord sheet content not found" });
    }

    return res.json(chordSheet);
  } catch (e) {
    return res.status(502).json({ error: "Failed to fetch chord sheet", details: (e as Error).message });
  } finally {
    if (browser) await browser.close();
  }
}
