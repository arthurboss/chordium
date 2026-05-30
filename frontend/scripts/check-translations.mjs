#!/usr/bin/env node

/**
 * Translation sync script
 * Scans source files for t() and i18n.t() calls, compares against locale JSON files,
 * and auto-fixes issues:
 * - Removes unused keys from all locales
 * - Scaffolds missing keys in non-reference locales (copies value from en/)
 * - Adds placeholder keys to en/ for keys used in code but not defined
 *
 * Usage: node scripts/check-translations.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_DIR = join(__dirname, "../src");
const LOCALES_DIR = join(SRC_DIR, "locales");

function collectSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === "locales" || entry === "__tests__") continue;
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, files);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !entry.includes(".test.") && !entry.includes(".spec.")) {
      files.push(full);
    }
  }
  return files;
}

function extractUsedKeys(files) {
  const keys = new Set();
  const pattern = /(?:i18n\.t|(?<!\w)t)\(\s*["'`]([^"'`]+)["'`]/g;

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Set a nested key in an object by dot path
function setNestedKey(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// Delete a nested key from an object by dot path, cleaning empty parents
function deleteNestedKey(obj, dotPath) {
  const parts = dotPath.split(".");
  const stack = [obj];
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) return;
    current = current[parts[i]];
    stack.push(current);
  }

  delete current[parts[parts.length - 1]];

  // Clean empty parent objects
  for (let i = parts.length - 2; i >= 0; i--) {
    if (Object.keys(stack[i + 1]).length === 0) {
      delete stack[i][parts[i]];
    } else {
      break;
    }
  }
}

// Get a nested value by dot path
function getNestedValue(obj, dotPath) {
  const parts = dotPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

function loadLocaleFiles() {
  const locales = {};
  for (const locale of readdirSync(LOCALES_DIR)) {
    const localeDir = join(LOCALES_DIR, locale);
    if (!statSync(localeDir).isDirectory()) continue;
    locales[locale] = {};
    for (const file of readdirSync(localeDir)) {
      if (!file.endsWith(".json")) continue;
      const ns = file.replace(".json", "");
      locales[locale][ns] = JSON.parse(readFileSync(join(localeDir, file), "utf-8"));
    }
  }
  return locales;
}

function saveLocaleFile(locale, ns, data) {
  const filePath = join(LOCALES_DIR, locale, `${ns}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function parseKey(raw, defaultNS = "common") {
  if (raw.includes(":")) {
    const [ns, ...rest] = raw.split(":");
    return { ns, key: rest.join(":") };
  }
  return { ns: defaultNS, key: raw };
}

// Known dynamic keys (template literals, plural suffixes, indirect references)
const DYNAMIC_KEYS = new Set([
  "common:theme.light",
  "common:theme.dark",
  "common:theme.system",
  "common:language.en",
  "common:language.ptBR",
  "common:jamSession.sharePeers_other",
]);

// Patterns to ignore in "missing" (template literals produce invalid keys)
const IGNORE_MISSING_PATTERNS = [/\$\{/];

// Main
const sourceFiles = collectSourceFiles(SRC_DIR);
const usedRaw = extractUsedKeys(sourceFiles);
const localeData = loadLocaleFiles();
const localeNames = Object.keys(localeData);

if (localeNames.length === 0) {
  console.error("No locales found in", LOCALES_DIR);
  process.exit(1);
}

const referenceLocale = "en";
const otherLocales = localeNames.filter((l) => l !== referenceLocale);

function fullKeySet(locale) {
  const set = new Set();
  for (const [ns, data] of Object.entries(localeData[locale])) {
    for (const k of flattenKeys(data)) {
      set.add(`${ns}:${k}`);
    }
  }
  return set;
}

const refKeys = fullKeySet(referenceLocale);

const usedNormalized = new Set();
for (const raw of usedRaw) {
  const { ns, key } = parseKey(raw);
  usedNormalized.add(`${ns}:${key}`);
}

let fixCount = 0;

// 1. Remove unused keys from all locales
const unused = [...refKeys]
  .filter((k) => !usedNormalized.has(k))
  .filter((k) => !DYNAMIC_KEYS.has(k));

if (unused.length > 0) {
  console.log(`\n\x1b[33m⚠ Removing ${unused.length} unused keys:\x1b[0m`);
  for (const fullKey of unused) {
    const { ns, key } = parseKey(fullKey);
    console.log(`  - ${fullKey}`);
    for (const locale of localeNames) {
      if (localeData[locale][ns]) {
        deleteNestedKey(localeData[locale][ns], key);
      }
    }
    fixCount++;
  }
}

// 2. Add missing keys to reference locale (used in code but not defined)
const missing = [...usedNormalized]
  .filter((k) => !refKeys.has(k))
  .filter((k) => !IGNORE_MISSING_PATTERNS.some((p) => p.test(k)));

if (missing.length > 0) {
  console.log(`\n\x1b[31m✗ Adding ${missing.length} missing keys to ${referenceLocale}/:\x1b[0m`);
  for (const fullKey of missing.sort()) {
    const { ns, key } = parseKey(fullKey);
    const placeholder = `__TODO__${key}`;
    console.log(`  + ${fullKey} = "${placeholder}"`);
    if (!localeData[referenceLocale][ns]) localeData[referenceLocale][ns] = {};
    setNestedKey(localeData[referenceLocale][ns], key, placeholder);
    fixCount++;
  }
}

// Refresh refKeys after additions
const updatedRefKeys = fullKeySet(referenceLocale);

// 3. Scaffold missing keys in other locales (copy from en/)
for (const locale of otherLocales) {
  const localeKeys = fullKeySet(locale);
  const diff = [...updatedRefKeys].filter((k) => !localeKeys.has(k));

  if (diff.length > 0) {
    console.log(`\n\x1b[36m→ Scaffolding ${diff.length} keys in ${locale}/ from ${referenceLocale}/:\x1b[0m`);
    for (const fullKey of diff.sort()) {
      const { ns, key } = parseKey(fullKey);
      const refValue = getNestedValue(localeData[referenceLocale][ns], key);
      const value = typeof refValue === "string" ? `__TRANSLATE__${refValue}` : refValue;
      console.log(`  + ${fullKey}`);
      if (!localeData[locale][ns]) localeData[locale][ns] = {};
      setNestedKey(localeData[locale][ns], key, value);
      fixCount++;
    }
  }
}

// 4. Remove extra keys in other locales (not in reference)
for (const locale of otherLocales) {
  const localeKeys = fullKeySet(locale);
  const extra = [...localeKeys].filter((k) => !updatedRefKeys.has(k));

  if (extra.length > 0) {
    console.log(`\n\x1b[33m⚠ Removing ${extra.length} extra keys from ${locale}/:\x1b[0m`);
    for (const fullKey of extra.sort()) {
      const { ns, key } = parseKey(fullKey);
      console.log(`  - ${fullKey}`);
      deleteNestedKey(localeData[locale][ns], key);
      fixCount++;
    }
  }
}

// Write all files
if (fixCount > 0) {
  for (const locale of localeNames) {
    for (const [ns, data] of Object.entries(localeData[locale])) {
      saveLocaleFile(locale, ns, data);
    }
  }
  console.log(`\n\x1b[32m✓ Fixed ${fixCount} issues. Locale files updated.\x1b[0m\n`);
} else {
  console.log("\n\x1b[32m✓ All translations are in sync!\x1b[0m\n");
}
