import type { CalendarPort } from "../layer1/calendar/types.js";
import { gregorianToJulianDayNumber } from "../layer1/calendar/julian.js";
import type { Branch, Stem } from "../layer1/enums.js";
import { solarYearLabelUtc, yearPillarForSolarYear } from "../layer1/pillars.js";
import { stemBranchToIndex } from "../layer1/sexagenary.js";
import { MONTH_START_TERM_IDS } from "../layer1/solarTerms/constants.js";
import type { SolarTermStore } from "../layer1/solarTerms/store.js";
import type { InsenLayer2, DynamicTimeline } from "../schemas/layer2.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import type { CalculateContext, CalculateUser } from "../schemas/calculateInput.js";

/**
 * `context.timeZone` 上の暦日で満年齢（誕生日未到達なら 1 引く）。
 * 大運の厳密な切替（節入り基準など）は監修 ruleset に委ねる（mock では使わない）。
 */
export function calendarAgeLocalYmd(birthDateYmd: string, asOfYmd: string): number {
  const [by, bm, bd] = birthDateYmd.split("-").map((x) => parseInt(x, 10));
  const [ay, am, ad] = asOfYmd.split("-").map((x) => parseInt(x, 10));
  let age = ay - by;
  if (am < bm || (am === bm && ad < bd)) age -= 1;
  return age;
}

type DaiunDirection = "forward" | "backward";

function parseYmd(ymd: string): { y: number; m: number; d: number } {
  const [y, m, d] = ymd.split("-").map((x) => parseInt(x, 10));
  return { y, m, d };
}

function toLocalJdn(ymd: string): number {
  const { y, m, d } = parseYmd(ymd);
  return gregorianToJulianDayNumber(y, m, d);
}

export function normalizeMod60(index: number): number {
  return ((index % 60) + 60) % 60;
}

export function determineDaiunDirection(yearStem: number, gender: "male" | "female"): DaiunDirection {
  const isYangYearStem = yearStem % 2 === 0;
  if (isYangYearStem) return gender === "male" ? "forward" : "backward";
  return gender === "male" ? "backward" : "forward";
}

export function roundDaiunStartAge(dayDiff: number): number {
  const rounded = Math.round(dayDiff / 3);
  if (rounded <= 0) return 1;
  if (rounded >= 11) return 10;
  return rounded;
}

function resolveMonthStartTermDayDiff(
  birthInstantUtcMs: number,
  direction: DaiunDirection,
  birthDate: string,
  timeZone: string,
  solarTermStore: SolarTermStore,
  port: CalendarPort,
): number {
  const monthStartTermSet = new Set(MONTH_START_TERM_IDS);
  const all = solarTermStore.all;
  let atOrBefore = -1;
  for (let i = 0; i < all.length; i++) {
    if (all[i]!.instantUtcMs <= birthInstantUtcMs) atOrBefore = i;
    else break;
  }
  if (atOrBefore < 0) {
    throw new Error("resolveDynamicTimeline: no month start term at or before birth instant");
  }
  let target;
  if (direction === "backward") {
    for (let i = atOrBefore; i >= 0; i--) {
      const e = all[i]!;
      if (monthStartTermSet.has(e.termId)) {
        target = e;
        break;
      }
    }
  } else {
    for (let i = atOrBefore + 1; i < all.length; i++) {
      const e = all[i]!;
      if (monthStartTermSet.has(e.termId)) {
        target = e;
        break;
      }
    }
  }
  if (!target) {
    throw new Error("resolveDynamicTimeline: no month start term found for direction");
  }
  const birthJdn = toLocalJdn(birthDate);
  const targetLocalDate = port.utcMsToLocalDateString(target.instantUtcMs, timeZone);
  const targetJdn = toLocalJdn(targetLocalDate);
  const diff = direction === "forward" ? targetJdn - birthJdn : birthJdn - targetJdn;
  if (diff < 0) throw new Error("resolveDynamicTimeline: negative day diff");
  return diff;
}

export function resolveDynamicTimeline(
  user: CalculateUser,
  context: CalculateContext,
  insen: InsenLayer2,
  ruleset: BundledRuleset,
  solarTermStore: SolarTermStore,
  port: CalendarPort,
): DynamicTimeline {
  const isResearch =
    (ruleset.meta.rulesetVersion === "research-v1" ||
      ruleset.meta.rulesetVersion === "research-experimental-v1") &&
    ruleset.researchDaiun !== undefined;
  const tm = ruleset.timelineMock;
  const span = tm.phaseSpanYears;
  const age = calendarAgeLocalYmd(user.birthDate, context.asOf);

  let startAge = tm.fixedStartAge;
  let direction: DaiunDirection | undefined;
  let firstPhaseIndex = tm.firstPhaseSexagenaryIndex;
  let startDayDiff: number | undefined;
  if (isResearch) {
    direction = determineDaiunDirection(insen.year.stem, user.gender);
    const birthInstantUtcMs = port.localWallTimeToUtcMs(user.birthDate, user.birthTime, context.timeZone);
    startDayDiff = resolveMonthStartTermDayDiff(
      birthInstantUtcMs,
      direction,
      user.birthDate,
      context.timeZone,
      solarTermStore,
      port,
    );
    startAge = roundDaiunStartAge(startDayDiff);
    const monthIndex = stemBranchToIndex(insen.month.stem as Stem, insen.month.branch as Branch);
    if (monthIndex < 0) throw new Error("resolveDynamicTimeline: invalid month pillar");
    firstPhaseIndex = normalizeMod60(monthIndex + (direction === "forward" ? 1 : -1));
  }

  const effectiveAge = age - startAge;
  const phases = [];
  for (let i = 0; i < tm.phaseCount; i++) {
    const shift = direction === "backward" ? -i : i;
    phases.push({
      phaseIndex: i,
      sexagenaryIndex: normalizeMod60(firstPhaseIndex + shift),
      spanYears: span,
    });
  }
  const slot = effectiveAge >= 0 ? Math.min(Math.floor(effectiveAge / span), tm.phaseCount - 1) : 0;
  const currentPhase = phases[slot]!;

  const asOfInstant = port.localWallTimeToUtcMs(context.asOf, null, context.timeZone);
  const solarYear = solarYearLabelUtc(solarTermStore, asOfInstant);
  const yearPillar = yearPillarForSolarYear(solarYear);
  const sexagenaryIndex = stemBranchToIndex(yearPillar.stem, yearPillar.branch);
  if (sexagenaryIndex < 0) {
    throw new Error("resolveDynamicTimeline: invalid year pillar");
  }
  const relatedStarId = `${tm.annualStarPlaceholder}_${sexagenaryIndex}_d${insen.day.stem}`;
  const calendarYear = parseInt(context.asOf.split("-")[0]!, 10);

  const daiun = {
    startAge,
    phases,
    currentPhase,
    ...(direction !== undefined ? { direction } : {}),
    ...(startDayDiff !== undefined ? { startDayDiff } : {}),
  };

  return {
    daiun,
    annual: {
      calendarYear,
      sexagenaryIndex,
      relatedStarId,
    },
  };
}
