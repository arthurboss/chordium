#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureFile = path.join(here, "fixtures", "android-e2e-backup.json");
const fixture = JSON.parse(fs.readFileSync(fixtureFile, "utf8"));
const packageName = "app.chordium.dev";
const cdpPort = 9333;

const serialFlag = process.argv.indexOf("--serial");
const requestedSerial = serialFlag >= 0 ? process.argv[serialFlag + 1] : undefined;

function adbDevices() {
  return execFileSync("adb", ["devices"], { encoding: "utf8" })
    .split("\n")
    .filter((line) => line.includes("\tdevice"))
    .map((line) => line.split("\t")[0].trim());
}

const emulators = adbDevices().filter((serial) => serial.startsWith("emulator-"));
const serial = requestedSerial || emulators[0];

if (!serial) {
  console.error("No running emulator found. Start one or pass --serial emulator-5554.");
  process.exit(1);
}
if (!serial.startsWith("emulator-")) {
  console.error(`Refusing to run against physical device ${serial}. This test clears app data.`);
  process.exit(1);
}

function adb(...args) {
  return execFileSync("adb", ["-s", serial, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPid() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const pid = adb("shell", "pidof", packageName);
      if (pid) return pid;
    } catch {
      // app not running yet
    }
    await sleep(250);
  }
  throw new Error("Chordium process did not start.");
}

async function waitForDevtoolsPage() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((entry) => entry.type === "page" && entry.url.includes("localhost"));
      if (page) return page;
    } catch {
      // forwarding not ready yet
    }
    await sleep(250);
  }
  throw new Error("WebView devtools endpoint did not appear.");
}

class Cdp {
  constructor(url) {
    this.url = url;
    this.nextId = 0;
    this.pending = new Map();
  }

  async open() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        this.pending.get(message.id)(message);
        this.pending.delete(message.id);
      }
    };
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 30000);
      this.pending.set(id, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const message = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (message.result.exceptionDetails) {
      throw new Error(`Page exception: ${message.result.exceptionDetails.text}`);
    }
    return message.result.result.value;
  }

  async waitFor(expression, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.evaluate(expression)) return;
      await sleep(250);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async waitForValue(expression, predicate, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const value = await this.evaluate(expression);
      if (predicate(value)) return value;
      await sleep(250);
    }
    throw new Error(`Timed out waiting for value: ${expression}`);
  }

  close() {
    this.socket?.close();
  }
}

async function attach() {
  const pid = await waitForPid();
  try {
    adb("forward", "--remove", `tcp:${cdpPort}`);
  } catch {
    // no previous forward
  }
  adb("forward", `tcp:${cdpPort}`, `localabstract:webview_devtools_remote_${pid}`);
  const page = await waitForDevtoolsPage();
  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.open();
  return cdp;
}

async function setBackupFile(cdp, base64) {
  const result = await cdp.evaluate(`(() => {
    const input = document.querySelector('input[type="file"][accept*="gzip"]');
    if (!input) return false;
    const bytes = Uint8Array.from(atob("${base64}"), (character) => character.charCodeAt(0));
    const file = new File([bytes], "chordium-e2e-backup.json.gz", { type: "application/gzip" });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  if (!result) throw new Error("Backup import input not found.");
}

const countExpression = `new Promise((resolve) => {
  const open = indexedDB.open("chordium-v1");
  open.onerror = () => resolve(false);
  open.onsuccess = () => {
    const db = open.result;
    const tx = db.transaction(["songsMetadata", "chordSheets", "fullChordSheets", "songLyrics"], "readonly");
    const metadata = tx.objectStore("songsMetadata").getAll();
    const chords = tx.objectStore("chordSheets").getAll();
    const full = tx.objectStore("fullChordSheets").getAll();
    const lyrics = tx.objectStore("songLyrics").getAll();
    tx.oncomplete = () => resolve(
      metadata.result.length === 2 &&
      chords.result.length === 2 &&
      full.result.length === 1 &&
      lyrics.result.length === 1
    );
  };
})`;

const snapshotExpression = `new Promise((resolve) => {
  const open = indexedDB.open("chordium-v1");
  open.onerror = () => resolve("{}");
  open.onsuccess = () => {
    const db = open.result;
    const tx = db.transaction(["songsMetadata", "chordSheets", "fullChordSheets", "songLyrics"], "readonly");
    const metadata = tx.objectStore("songsMetadata").getAll();
    const chords = tx.objectStore("chordSheets").getAll();
    const full = tx.objectStore("fullChordSheets").getAll();
    const lyrics = tx.objectStore("songLyrics").getAll();
    tx.oncomplete = () => resolve(JSON.stringify({
      metadata: metadata.result.map((record) => ({
        path: record.path,
        saved: Boolean(record.storage && record.storage.saved),
      })),
      chords: chords.result.map((record) => ({
        path: record.path,
        songChords: record.songChords,
      })),
      full: full.result.map((record) => record.path),
      lyrics: lyrics.result.map((record) => ({
        path: record.path,
        translations: record.translations,
      })),
    }));
  };
})`;

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} mismatch.\nactual: ${JSON.stringify(actual)}\nexpected: ${JSON.stringify(expected)}`);
  }
}

async function run() {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "chordium-e2e-"));
  const localBackup = path.join(temporaryDirectory, "chordium-e2e-backup.json.gz");
  fs.writeFileSync(localBackup, zlib.gzipSync(fs.readFileSync(fixtureFile)));

  let cdp;
  try {
    console.log(`Using ${serial}`);
    adb("shell", "pm", "clear", packageName);
    adb("shell", "am", "start", "-W", "-n", `${packageName}/.MainActivity`);

    cdp = await attach();
    await cdp.waitFor('!!document.querySelector(\'input[type="file"][accept*="gzip"]\')');
    await setBackupFile(cdp, fs.readFileSync(localBackup).toString("base64"));
    await cdp.waitFor(countExpression);
    console.log("import: 2 songs, 2 sheets, 1 full arrangement, 1 lyric set");

    const snapshot = JSON.parse(await cdp.evaluate(snapshotExpression));
    const expectedPaths = fixture.songs.map((song) => song.metadata.path).sort();
    assertDeepEqual(
      snapshot.metadata.map((record) => record.path).sort(),
      expectedPaths,
      "metadata paths"
    );
    if (!snapshot.metadata.every((record) => record.saved)) {
      throw new Error("Imported songs are not all marked saved.");
    }
    for (const song of fixture.songs) {
      const actual = snapshot.chords.find((record) => record.path === song.metadata.path);
      assertDeepEqual(actual?.songChords, song.chordSheet.songChords, `content ${song.metadata.path}`);
    }
    assertDeepEqual(
      [...snapshot.full].sort(),
      fixture.songs.filter((song) => song.fullChordSheet).map((song) => song.metadata.path).sort(),
      "full arrangements"
    );
    assertDeepEqual(
      [...snapshot.lyrics].sort((left, right) => left.path.localeCompare(right.path)),
      fixture.songs
        .filter((song) => song.lyrics)
        .map((song) => ({ path: song.metadata.path, translations: song.lyrics.translations })),
      "lyrics"
    );

    await cdp.evaluate(`(() => {
      const title = document.querySelector('h3[title="Wonderwall"]');
      title?.click();
      return Boolean(title);
    })()`);
    await cdp.waitFor('location.pathname === "/oasis/wonderwall"');
    await sleep(1000);

    await cdp.evaluate(`(() => {
      const menu = [...document.querySelectorAll('button')].find(
        (button) => button.getAttribute('aria-label') === 'Menu'
      );
      menu?.click();
      return Boolean(menu);
    })()`);
    await sleep(600);
    await cdp.evaluate(`(() => {
      const row = [...document.querySelectorAll('button')].find((button) =>
        /jam|sessão/i.test(button.textContent)
      );
      row?.click();
      return Boolean(row);
    })()`);
    const jamUrl = await cdp.waitForValue(
      `(() => {
        const input = [...document.querySelectorAll('input')].find((candidate) =>
          /jam/i.test(candidate.getAttribute('aria-label') || '')
        );
        return input?.value || '';
      })()`,
      (value) => value.startsWith("http")
    );
    const jamOrigin = new URL(jamUrl).origin;
    if (jamOrigin !== "https://chordium.vercel.app") {
      throw new Error(`Jam link points at ${jamOrigin}`);
    }
    console.log(`jam link: ${jamUrl.slice(0, 80)}...`);

    const api = await cdp.evaluate(`fetch("https://chordium.vercel.app/api/search?q=oasis")
      .then(async (response) => ({ ok: response.ok, status: response.status, body: (await response.text()).slice(0, 80) }))`);
    if (!api.ok || api.status !== 200 || !api.body) {
      throw new Error(`API search failed through the native bridge: ${JSON.stringify(api)}`);
    }
    console.log("api: search succeeded through the native bridge");

    adb("shell", "cmd", "connectivity", "airplane-mode", "enable");
    await sleep(2000);
    adb("shell", "am", "force-stop", packageName);
    adb("shell", "am", "start", "-W", "-n", `${packageName}/.MainActivity`);
    cdp.close();
    cdp = await attach();
    await cdp.waitFor(countExpression);
    await cdp.waitFor('document.body.innerText.includes("Wonderwall")');
    console.log("offline: app restarted with imported library intact");
  } finally {
    try {
      adb("shell", "cmd", "connectivity", "airplane-mode", "disable");
    } catch {
      // device may be gone
    }
    try {
      adb("forward", "--remove", `tcp:${cdpPort}`);
    } catch {
      // no forward
    }
    cdp?.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }

  console.log("android e2e: PASS");
}

run().catch((error) => {
  console.error(`android e2e: FAIL\n${error.stack || error.message}`);
  process.exit(1);
});
