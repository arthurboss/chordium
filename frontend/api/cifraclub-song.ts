import type { VercelRequest, VercelResponse } from "@vercel/node";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { fetchPreferredChordSheet, type PageLike } from "@chordium/scraping";

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

  const baseUrl = `https://www.cifraclub.com.br/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const { data, variant, hasTabs } = await fetchPreferredChordSheet(page as unknown as PageLike, baseUrl);
    return res.json({ ...data, variant, hasTabs });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "NOT_FOUND") {
      return res.status(404).json({ error: "Song not found" });
    }
    return res.status(502).json({ error: "Failed to fetch song", details: (e as Error).message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
