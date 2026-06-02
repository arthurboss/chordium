import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { fetchJsonpDocs } from "./_jsonp.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artist = "", song = "" } = req.query as Record<string, string>;
  const query = [artist, song].filter(Boolean).join(" ").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing artist query parameter" });
  }

  try {
    const { rows } = await sql`
      SELECT "displayName", path, "songCount"
      FROM artists
      WHERE "displayName" ILIKE ${"%" + query.replace(/[%_]/g, "\\$&") + "%"}
      LIMIT 50
    `;
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch {
    // fall through to JSONP
  }

  try {
    const docs = await fetchJsonpDocs(query);
    const artists = docs
      .filter((d) => d.t === "1" && d.d)
      .map((d) => ({ displayName: d.m, path: d.d, songCount: null }));
    return res.json(artists);
  } catch (e) {
    return res.status(502).json({ error: "Search unavailable", details: (e as Error).message });
  }
}
