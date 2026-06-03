import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import { fetchJsonpDocs } from "./_jsonp.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artist = "", song = "" } = req.query as Record<string, string>;
  const query = [artist, song].filter(Boolean).join(" ").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing artist query parameter" });
  }

  const escaped = query.replace(/[%_]/g, "\\$&");

  // Fetch from Neon and JSONP in parallel
  const [dbResult, jsonpDocs] = await Promise.allSettled([
    sql`
      SELECT "displayName", path, "songCount"
      FROM artists
      WHERE "displayName" ILIKE ${"%" + escaped + "%"}
      LIMIT 50
    `,
    fetchJsonpDocs(query),
  ]);

  const dbRows =
    dbResult.status === "fulfilled" ? dbResult.value.rows : [];
  const jsonpArtists =
    jsonpDocs.status === "fulfilled"
      ? jsonpDocs.value
          .filter((d) => d.t === "1" && d.d)
          .map((d) => ({ displayName: d.m, path: d.d, songCount: null }))
      : [];

  // Merge: DB first (richer data), JSONP fills gaps
  const seen = new Set(dbRows.map((r) => r.path));
  const newFromJsonp = jsonpArtists.filter((a) => !seen.has(a.path));
  const merged = [...dbRows, ...newFromJsonp];

  // Seed Neon with anything JSONP found that wasn't in DB
  if (newFromJsonp.length > 0) {
    Promise.all(
      newFromJsonp.map((a) =>
        sql`
          INSERT INTO artists ("displayName", path, "songCount")
          VALUES (${a.displayName}, ${a.path}, ${a.songCount})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => {})
      )
    ).catch(() => {});
  }

  return res.json(merged);
}
