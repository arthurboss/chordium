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
  const { artistPath } = req.query as Record<string, string>;

  if (!artistPath) {
    return res.status(400).json({ error: "Missing artistPath parameter" });
  }

  // Check Neon DB first
  try {
    const { rows } = await sql`
      SELECT title, artist, path
      FROM songs
      WHERE path LIKE ${artistPath + "/%"}
      ORDER BY title
    `;
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch {
    // fall through to JSONP
  }

  // Fallback: fetch artist songs via JSONP search using artist slug
  const artistName = artistPath
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const response = await axios.get<string>(JSONP_URL, {
    params: { q: artistName, callback: "x" },
  });

  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed = JSON.parse(jsonStr);
  const docs: JsonpDoc[] = parsed.response?.docs ?? [];

  const songs = docs
    .filter((d) => d.t === "2" && d.d === artistPath && d.u)
    .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }));

  // Seed DB in background (don't await — don't block response)
  if (songs.length > 0) {
    Promise.all(
      songs.map((s) =>
        sql`
          INSERT INTO songs (title, artist, path)
          VALUES (${s.title}, ${s.artist}, ${s.path})
          ON CONFLICT (path) DO NOTHING
        `.catch(() => {})
      )
    );
  }

  return res.json(songs);
}
