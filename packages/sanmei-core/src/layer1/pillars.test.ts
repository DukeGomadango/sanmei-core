import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Stem, Branch } from "./enums.js";
import { gregorianToJulianDayNumber } from "./calendar/julian.js";
import { DAY_PILLAR_JDN_ADDEND } from "./pillarConstants.js";
import {
  dayPillarForLocalDate,
  resolveInsenThreePillars,
  resolveInsenWithDepth,
  yearPillarForSolarYear,
} from "./pillars.js";
import { SolarTermStore } from "./solarTerms/store.js";
import type { SolarTermsFile } from "./solarTerms/types.js";
import { createJodaCalendarPort } from "./calendar/jodaAdapter.js";
import { requiresBirthTimeForAnySolarTermOnDate } from "./calendar/calendarBoundary.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const solarPath = join(pkgRoot, "data", "solar-terms", "solar_terms.json");
const solarFile = JSON.parse(readFileSync(solarPath, "utf-8")) as SolarTermsFile;
const store = new SolarTermStore(solarFile);
const port = createJodaCalendarPort();

describe("julian day pillar", () => {
  it("2024-02-10 は甲辰（index 40）にキャリブレーション", () => {
    const jdn = gregorianToJulianDayNumber(2024, 2, 10);
    const idx = (((jdn + DAY_PILLAR_JDN_ADDEND) % 60) + 60) % 60;
    expect(idx).toBe(40);
    const d = dayPillarForLocalDate("2024-02-10");
    expect(d.stem).toBe(Stem.JIA);
    expect(d.branch).toBe(Branch.CHEN);
  });
});

describe("year pillar anchor", () => {
  it("2024 太陽年は甲辰", () => {
    const y = yearPillarForSolarYear(2024);
    expect(y.stem).toBe(Stem.JIA);
    expect(y.branch).toBe(Branch.CHEN);
  });
});

describe("insen three pillars", () => {
  it("JST サンプルで三柱が得られる", () => {
    const r = resolveInsenThreePillars(
      { birthDate: "2000-06-15", birthTime: "12:00", timeZoneId: "Asia/Tokyo" },
      store,
      port,
    );
    expect(r.year.stem).toBeGreaterThanOrEqual(0);
    expect(r.month.stem).toBeGreaterThanOrEqual(0);
    expect(r.day.stem).toBeGreaterThanOrEqual(0);
  });
});

describe("resolveInsenWithDepth", () => {
  it("displayDepth は rawDelta + SOLAR_TERM_DAY_ZERO_INDEXING と一致", () => {
    const r = resolveInsenWithDepth(
      { birthDate: "2000-06-15", birthTime: "12:00", timeZoneId: "Asia/Tokyo" },
      store,
      port,
    );
    expect(r.displayDepth).toBe(r.rawDelta + 1);
  });
});

describe("TIME_REQUIRED heuristic", () => {
  it("節入り当日・時刻なしで true になりうる", () => {
    const z = store.all.find((e) => e.termId === "lichun" && e.instantUtcMs > Date.UTC(2020, 0, 1));
    expect(z).toBeDefined();
    const local = port.utcMsToLocalDateString(z!.instantUtcMs, "Asia/Tokyo");
    const need = requiresBirthTimeForAnySolarTermOnDate(store, local, null, "Asia/Tokyo", port);
    expect(need).toBe(true);
  });
});
