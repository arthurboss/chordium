import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = process.env.CI === "true"; // Render and Vercel set this
const useNpm = process.env.USE_NPM === "true"; // Override to use npm version

const version = isCI || useNpm
  ? execSync("npm view @chordium/types version")
      .toString()
      .trim()
  : "workspace:*";

const targets = ["frontend", "backend"];

targets.forEach((pkg) => {
  const pkgPath = path.join(__dirname, "..", pkg, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  if (pkgJson.dependencies && pkgJson.dependencies["@chordium/types"]) {
    pkgJson.dependencies["@chordium/types"] = (isCI || useNpm) ? `^${version}` : version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
    console.log(
      `Updated @chordium/types to ${pkgJson.dependencies["@chordium/types"]} in ${pkg}`
    );
  }
});
