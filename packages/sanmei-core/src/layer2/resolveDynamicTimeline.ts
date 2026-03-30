import type { CalendarPort } from "../layer1/calendar/types.js";
import { solarYearLabelUtc, yearPillarForSolarYear } from "../layer1/pillars.js";
import { stemBranchToIndex } from "../layer1/sexagenary.js";
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

export function resolveDynamicTimeline(
  user: CalculateUser,
  context: CalculateContext,
  insen: InsenLayer2,
  ruleset: BundledRuleset,
  solarTermStore: SolarTermStore,
  port: CalendarPort,
): DynamicTimeline {
  const tm = ruleset.timelineMock;
  const age = calendarAgeLocalYmd(user.birthDate, context.asOf);
  const effectiveAge = age - tm.fixedStartAge;
  const span = tm.phaseSpanYears;
  const phases = [];
  for (let i = 0; i < tm.phaseCount; i++) {
    phases.push({
      phaseIndex: i,
      sexagenaryIndex: (tm.firstPhaseSexagenaryIndex + i) % 60,
      spanYears: span,
    });
  }
  let slot = 0;
  if (effectiveAge >= 0) {
    slot = Math.min(Math.floor(effectiveAge / span), tm.phaseCount - 1);
  }
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

  return {
    daiun: {
      startAge: tm.fixedStartAge,
      phases,
      currentPhase,
    },
    annual: {
      calendarYear,
      sexagenaryIndex,
      relatedStarId,
    },
  };
}
