import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

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

  // Try Supabase first
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .ilike("displayName", `%${query}%`);

      if (!error && data && data.length > 0) {
        return res.json(
          data.map((a: any) => ({
            displayName: a.displayName,
            path: a.path,
            songCount: a.songCount ?? null,
          }))
        );
      }
    } catch {
      // fall through to JSONP
    }
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
