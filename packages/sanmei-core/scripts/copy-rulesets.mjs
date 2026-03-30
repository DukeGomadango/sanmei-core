import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const srcDir = join(pkgRoot, "src", "data", "rulesets");
const destDir = join(pkgRoot, "dist", "data", "rulesets");

mkdirSync(destDir, { recursive: true });
for (const name of readdirSync(srcDir).filter((f) => f.endsWith(".json"))) {
  copyFileSync(join(srcDir, name), join(destDir, name));
}
