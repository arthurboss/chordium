import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import handler from "serve-handler";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const OUT_DIR = DIST_DIR; // write html into dist paths
const PORT = 5055;

const ROUTES = ["/", "/search", "/my-chord-sheets", "/upload"];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeHtmlForRoute(routePath, html) {
  const normalized = routePath.endsWith("/")
    ? routePath.slice(0, -1)
    : routePath;
  const targetDir =
    normalized === "" || normalized === "/"
      ? OUT_DIR
      : path.join(OUT_DIR, normalized);
  await ensureDir(targetDir);
  const filePath = path.join(targetDir, "index.html");
  await fs.writeFile(filePath, html, "utf8");
  return filePath;
}

async function startStaticServer() {
  const server = http.createServer((req, res) =>
    handler(req, res, {
      public: DIST_DIR,
      rewrites: [{ source: "**", destination: "/index.html" }],
    })
  );
  await new Promise((resolve) => server.listen(PORT, resolve));
  return server;
}

async function prerender() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    for (const route of ROUTES) {
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      // Small delay to allow any immediate layout effects
      await new Promise((r) => setTimeout(r, 120));
      const html = await page.content();
      const filePath = await writeHtmlForRoute(route, html);
      console.log(
        `Prerendered ${route} -> ${path.relative(DIST_DIR, filePath)}`
      );
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
