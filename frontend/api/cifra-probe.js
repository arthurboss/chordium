// Temporary probe — DELETE after testing.
export default async function handler(req, res) {
  const target = req.query.t || "song";

  const urls = {
    search: "https://solr.sscdn.co/cc/h2/?q=oasis+wonderwall&callback=x",
    artist: "https://www.cifraclub.com.br/oasis/",
    song:   "https://www.cifraclub.com.br/oasis/wonderwall/",
  };

  const url = urls[target];
  if (!url) {
    res.status(400).json({ error: "invalid target, use ?t=search|artist|song" });
    return;
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
    } else {
      result.has_pre     = text.includes("<pre");
      result.has_cifra_tom = text.includes("cifra_tom");
      result.has_song_id   = /songId/.test(text);
      if (result.has_pre) {
        const idx = text.indexOf("<pre");
        result.pre_snippet = text.slice(idx, idx + 300);
      }
    }

    res.status(200).json(result);
  } catch (e) {
    clearTimeout(timer);
    res.status(200).json({ target, url, error: e.message });
  }
}
