import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { fetchJsonpDocs } from "./_jsonp.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artistPath } = req.query as Record<string, string>;

  if (!artistPath) {
    return res.status(400).json({ error: "Missing artistPath parameter" });
  }

  // Escape SQL LIKE special chars in artistPath
  const escapedPath = artistPath.replace(/[%_]/g, "\\$&");

  try {
    const { rows } = await sql`
      SELECT title, artist, path
      FROM songs
      WHERE path LIKE ${escapedPath + "/%"}
      ORDER BY title
    `;
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch {
    // fall through to JSONP
  }

  // JSONP fallback — limited to ~5 results, only useful while DB is seeding.
  // Full artist song lists require Puppeteer (Render) for new artists.
  try {
    const docs = await fetchJsonpDocs(artistPath.replace(/-/g, " "));
    const songs = docs
      .filter((d) => d.t === "2" && d.d === artistPath && d.u)
      .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }));

    // Seed DB in background — don't block response
    if (songs.length > 0) {
      Promise.all(
        songs.map((s) =>
          sql`
            INSERT INTO songs (title, artist, path)
            VALUES (${s.title}, ${s.artist}, ${s.path})
            ON CONFLICT (path) DO NOTHING
          `.catch(() => {})
        )
      ).catch(() => {});
    }

    return res.json(songs);
  } catch (e) {
    return res.status(502).json({ error: "Artist songs unavailable", details: (e as Error).message });
  }
}
