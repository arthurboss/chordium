// Temporary probe — DELETE after testing.
export default async function handler(req, res) {
  const target = req.query.t || "song";

  const urls = {
    search:  "https://solr.sscdn.co/cc/h2/?q=oasis+wonderwall&callback=x",
    artist:  "https://www.cifraclub.com.br/oasis/",
    song:    "https://www.cifraclub.com.br/oasis/wonderwall/",
    busca:   "https://www.cifraclub.com.br/busca/?q=love",
    musicas: "https://www.cifraclub.com.br/hillsong-worship/musicas.html",
  };

  const url = urls[target];
  if (!url) {
    return res.status(400).json({ error: "invalid target, use ?t=search|artist|song|busca|musicas" });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const r = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timer);

    const text = await r.text();
    const result = { target, url, status: r.status, length: text.length };

    if (target === "search") {
      result.looks_valid = text.startsWith("x(");
      result.snippet = text.slice(0, 300);
    } else if (target === "musicas") {
      result.has_song_links = text.includes("art_music-link");
      result.song_link_count = (text.match(/art_music-link/g) || []).length;
      result.has_song_count = text.includes("musicas.html") || /\d+ músicas/.test(text);
      result.snippet = text.slice(0, 500);
    } else if (target === "busca") {
      result.has_results = text.includes("search-result") || text.includes("gs-title");
      result.snippet = text.slice(0, 500);
    } else {
      result.has_pre       = text.includes("<pre");
      result.has_cifra_tom = text.includes("cifra_tom");
      result.has_song_id   = /songId/.test(text);
    }

    return res.status(200).json(result);
  } catch (e) {
    clearTimeout(timer);
    return res.status(200).json({ target, url, error: e.message });
  }
}
