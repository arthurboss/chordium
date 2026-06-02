import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";
import axios from "axios";

const JSONP_URL = "https://solr.sscdn.co/cc/h2/";

interface JsonpDoc {
  t: "1" | "2";
  m: string;
  a: string;
  d: string;
  u?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { artist = "", song = "" } = req.query as Record<string, string>;
  const query = [artist, song].filter(Boolean).join(" ").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing artist query parameter" });
  }

  // Try Neon DB first
  try {
    const { rows } = await sql`
      SELECT display_name AS "displayName", path, song_count AS "songCount"
      FROM artists
      WHERE display_name ILIKE ${"%" + query + "%"}
      LIMIT 50
    `;
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch {
    // fall through to JSONP
  }

  // Fallback: CifraClub JSONP
  const response = await axios.get<string>(JSONP_URL, {
    params: { q: query, callback: "x" },
  });

  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed = JSON.parse(jsonStr);
  const docs: JsonpDoc[] = parsed.response?.docs ?? [];

  const artists = docs
    .filter((d) => d.t === "1" && d.d)
    .map((d) => ({ displayName: d.m, path: d.d, songCount: null }));

  return res.json(artists);
}
