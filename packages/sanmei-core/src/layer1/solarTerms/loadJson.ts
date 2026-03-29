import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SolarTermsFile } from "./types.js";
import { SolarTermStore } from "./store.js";

/** `packages/sanmei-core` ルート（本ファイルは `src/layer1/solarTerms/` にある想定） */
function packageRootDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
}

/** 既定の同梱マスタ（`data/solar-terms/solar_terms.json`） */
export function loadBundledSolarTerms(): SolarTermStore {
  const path = join(packageRootDir(), "data", "solar-terms", "solar_terms.json");
  const raw = readFileSync(path, "utf-8");
  const data = JSON.parse(raw) as SolarTermsFile;
  return new SolarTermStore(data);
}

export function parseSolarTermsJson(json: string): SolarTermStore {
  return new SolarTermStore(JSON.parse(json) as SolarTermsFile);
}
