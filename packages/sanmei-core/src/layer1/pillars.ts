import type { Branch, Stem } from "./enums.js";
import { MONTH_START_TERM_IDS, monthBranchForStartTerm } from "./solarTerms/constants.js";
import type { SolarTermStore } from "./solarTerms/store.js";
import {
  DAY_PILLAR_JDN_ADDEND,
  YEAR_PILLAR_ANCHOR_INDEX,
  YEAR_PILLAR_ANCHOR_SOLAR_YEAR,
} from "./pillarConstants.js";
import { gregorianToJulianDayNumber } from "./calendar/julian.js";
import { indexToStemBranch } from "./sexagenary.js";
import { monthStemFromYearAndBranch } from "./pillarRules.js";
import type { CalendarPort } from "./calendar/types.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";
import { SOLAR_TERM_DAY_ZERO_INDEXING } from "./pillarConstants.js";

export type Pillar = { stem: Stem; branch: Branch };

export type InsenThreePillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
};

/** Layer1 確定結果 + 蔵干用表示深さ（IMPLEMENTATION §5.0） */
export type ResolvedInsenWithDepth = InsenThreePillars & {
  /** JDN_birth - JDN_term（暦日差） */
  rawDelta: number;
  /** 蔵干テーブルと照合する深さ */
  displayDepth: number;
};

const MONTH_TERM_SET = new Set(MONTH_START_TERM_IDS);

function parseYmd(birthDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = birthDate.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) throw new Error(`invalid birthDate: ${birthDate}`);
  return { y, m, d };
}

/** 太陽年ラベル: 直近の立春の UTC 暦年（v1 簡略） */
export function solarYearLabelUtc(store: SolarTermStore, instantUtcMs: number): number {
  const lic = store.latestLichunAtOrBefore(instantUtcMs);
  if (!lic) throw new Error("birth instant precedes first 立春 in solar_terms master");
  return new Date(lic.instantUtcMs).getUTCFullYear();
}

export function yearPillarForSolarYear(solarYear: number): Pillar {
  const idx =
    (((solarYear - YEAR_PILLAR_ANCHOR_SOLAR_YEAR) % 60) + 60) % 60;
  const adj = (idx + YEAR_PILLAR_ANCHOR_INDEX) % 60;
  const { stem, branch } = indexToStemBranch(adj);
  return { stem, branch };
}

export function dayPillarForLocalDate(birthDate: string): Pillar {
  const { y, m, d } = parseYmd(birthDate);
  const jdn = gregorianToJulianDayNumber(y, m, d);
  const idx = (((jdn + DAY_PILLAR_JDN_ADDEND) % 60) + 60) % 60;
  const { stem, branch } = indexToStemBranch(idx);
  return { stem, branch };
}

export function monthPillarForInstant(
  store: SolarTermStore,
  instantUtcMs: number,
  yearStem: Stem,
): Pillar {
  const e = store.monthSectionEntryAtOrBefore(instantUtcMs, MONTH_TERM_SET);
  if (!e) throw new Error("could not resolve 節月 (master range?)");
  const mb = monthBranchForStartTerm(e.termId);
  if (mb === undefined) throw new Error(`not a 節月 term: ${e.termId}`);
  const stem = monthStemFromYearAndBranch(yearStem, mb);
  return { stem, branch: mb as Branch };
}

/**
 * 陰占三柱 + 表示深さ。`rawDelta < 0` のとき `SanmeiError` CALCULATION_ANOMALY。
 */
export function resolveInsenWithDepth(
  input: { birthDate: string; birthTime: string | null; timeZoneId: string },
  store: SolarTermStore,
  port: CalendarPort,
): ResolvedInsenWithDepth {
  const instantUtcMs = port.localWallTimeToUtcMs(
    input.birthDate,
    input.birthTime,
    input.timeZoneId,
  );
  const solarYear = solarYearLabelUtc(store, instantUtcMs);
  const year = yearPillarForSolarYear(solarYear);
  const month = monthPillarForInstant(store, instantUtcMs, year.stem);
  const day = dayPillarForLocalDate(input.birthDate);

  const e = store.monthSectionEntryAtOrBefore(instantUtcMs, MONTH_TERM_SET);
  if (!e) throw new Error("could not resolve 節月 for depth (master range?)");
  const termLocal = port.utcMsToLocalDateString(e.instantUtcMs, input.timeZoneId);
  const { y: ty, m: tm, d: td } = parseYmd(termLocal);
  const { y: by, m: bm, d: bd } = parseYmd(input.birthDate);
  const JDN_term = gregorianToJulianDayNumber(ty, tm, td);
  const JDN_birth = gregorianToJulianDayNumber(by, bm, bd);
  const rawDelta = JDN_birth - JDN_term;
  if (rawDelta < 0) {
    throw new SanmeiError(
      SanmeiErrorCode.CALCULATION_ANOMALY,
      "Negative depth (rawDelta)",
      { reason: "NEGATIVE_DEPTH", rawDelta, termLocal, birthDate: input.birthDate },
    );
  }
  const displayDepth = rawDelta + SOLAR_TERM_DAY_ZERO_INDEXING;

  return { year, month, day, rawDelta, displayDepth };
}

/**
 * 陰占三柱（Layer1）。`birthTime` が null のときローカル深夜 0:00 でインスタント化。
 */
export function resolveInsenThreePillars(
  input: { birthDate: string; birthTime: string | null; timeZoneId: string },
  store: SolarTermStore,
  port: CalendarPort,
): InsenThreePillars {
  const r = resolveInsenWithDepth(input, store, port);
  return { year: r.year, month: r.month, day: r.day };
}
