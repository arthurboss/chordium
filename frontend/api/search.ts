import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { unifiedSearch } from "@chordium/scraping";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q = "" } = req.query as Record<string, string>;

  if (!q.trim()) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const results = await unifiedSearch({ query: q, sql });
    return res.json(results);
  } catch (error) {
    return res.status(502).json({
      error: "Search failed",
      details: (error as Error).message,
    });
  }
}
