import type { VercelRequest, VercelResponse } from "@vercel/node";
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
    return res.status(400).json({ error: "Missing search query" });
  }

  const response = await axios.get<string>(JSONP_URL, {
    params: { q: query, callback: "x" },
  });

  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed = JSON.parse(jsonStr);
  const docs: JsonpDoc[] = parsed.response?.docs ?? [];

  // Song search: return t=2 docs
  const songs = docs
    .filter((d) => d.t === "2" && d.d && d.u)
    .map((d) => ({ title: d.m, artist: d.a, path: `${d.d}/${d.u}` }));

  return res.json(songs);
}
