import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { fetchJsonpDocs } from "./_jsonp.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artist = "", song = "" } = req.query as Record<string, string>;
  const query = [artist, song].filter(Boolean).join(" ").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const escaped = query.replace(/[%_]/g, "\\$&");
    const { rows } = await sql`
      SELECT title, artist, path
      FROM songs
      WHERE title ILIKE ${"%" + escaped + "%"}
         OR artist ILIKE ${"%" + escaped + "%"}
      ORDER BY title
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
    const songs = docs
      .filter((d) => d.t === "2" && d.d && d.u)
      .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }));
    return res.json(songs);
  } catch (e) {
    return res.status(502).json({ error: "Search unavailable", details: (e as Error).message });
  }
}
