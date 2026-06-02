import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { fetchJsonpDocs } from "./_jsonp.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artist = "", song = "" } = req.query as Record<string, string>;
  const query = [artist, song].filter(Boolean).join(" ").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const escaped = query.replace(/[%_]/g, "\\$&");

  // Fetch from Neon and JSONP in parallel
  const [dbResult, jsonpDocs] = await Promise.allSettled([
    sql`
      SELECT title, artist, path
      FROM songs
      WHERE title ILIKE ${"%" + escaped + "%"}
         OR artist ILIKE ${"%" + escaped + "%"}
      ORDER BY title
      LIMIT 50
    `,
    fetchJsonpDocs(query),
  ]);

  const dbRows =
    dbResult.status === "fulfilled" ? dbResult.value.rows : [];
  const jsonpSongs =
    jsonpDocs.status === "fulfilled"
      ? jsonpDocs.value
          .filter((d) => d.t === "2" && d.d && d.u)
          .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }))
      : [];

  // Merge: DB first, JSONP fills gaps
  const seen = new Set(dbRows.map((r) => r.path));
  const newFromJsonp = jsonpSongs.filter((s) => !seen.has(s.path));
  const merged = [...dbRows, ...newFromJsonp];

  // Seed Neon with anything JSONP found that wasn't in DB
  if (newFromJsonp.length > 0) {
    Promise.all(
      newFromJsonp.map((s) =>
        sql`
          INSERT INTO songs (title, artist, path)
          VALUES (${s.title}, ${s.artist}, ${s.path})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => {})
      )
    ).catch(() => {});
  }

  return res.json(merged);
}
