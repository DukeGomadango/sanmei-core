import { createRequire } from "node:module";
import { ZodError } from "zod";
import { CalculateInputSchema } from "./schemas/calculateInput.js";
import type { CalculateResult, InsenLayer2 } from "./schemas/layer2.js";
import { SanmeiError, SanmeiErrorCode } from "./errors/sanmeiError.js";
import { requiresBirthTimeForAnySolarTermOnDate } from "./layer1/calendar/calendarBoundary.js";
import { resolveInsenWithDepth } from "./layer1/pillars.js";
import type { SolarTermStore } from "./layer1/solarTerms/store.js";
import type { CalendarPort } from "./layer1/calendar/types.js";
import type { RulesetMockV1 } from "./schemas/rulesetMockV1.js";
import { bundledMockRulesetV1 } from "./layer2/bundledMockRuleset.js";
import { resolveZokanForBranch } from "./layer2/resolveZokan.js";
import { resolveSubordinateStars } from "./layer2/resolveSubordinateStars.js";
import { resolveGuardianKishin } from "./layer2/resolveGuardianKishin.js";
import { resolveMainStars } from "./layer2/resolveMainStars.js";
import { resolveFamilyNodes } from "./layer2/resolveFamilyNodes.js";
import { resolveEnergyData } from "./layer2/resolveEnergyData.js";
import { resolveDestinyBugs } from "./layer2/resolveDestinyBugs.js";

const require = createRequire(import.meta.url);
const { version: packageVersion } = require("../package.json") as { version: string };

export type CalculateDeps = {
  solarTermStore: SolarTermStore;
  port: CalendarPort;
  ruleset?: RulesetMockV1;
  nowUtcMs?: number;
};

function firstSolarTermMatchingBirthDate(
  store: SolarTermStore,
  birthDate: string,
  timeZoneId: string,
  port: CalendarPort,
) {
  for (const e of store.all) {
    if (port.utcMsToLocalDateString(e.instantUtcMs, timeZoneId) === birthDate) return e;
  }
  return undefined;
}

function mapCalendarFailure<T>(timeZoneId: string, fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof SanmeiError) throw e;
    throw new SanmeiError(SanmeiErrorCode.INVALID_TIMEZONE, "タイムゾーンまたは暦変換の解釈に失敗", {
      timeZoneId,
      cause: String(e),
    });
  }
}

/**
 * Layer2 Orchestrator: 入力検証 → 節入り日の時刻要否 → Layer1（深さ付）→ mock ruleset で陽占・守護神・六親。
 */
export function calculate(rawInput: unknown, deps: CalculateDeps): CalculateResult {
  let input;
  try {
    input = CalculateInputSchema.parse(rawInput);
  } catch (e) {
    if (e instanceof ZodError) {
      throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, "CalculateInput の検証に失敗", e.flatten());
    }
    throw e;
  }

  if (input.user.timeZoneId !== input.context.timeZone) {
    throw new SanmeiError(
      SanmeiErrorCode.VALIDATION_ERROR,
      "user.timeZoneId と context.timeZone は一致させてください",
      { userTimeZoneId: input.user.timeZoneId, contextTimeZone: input.context.timeZone },
    );
  }

  const tz = input.context.timeZone;
  const birthWall = { birthDate: input.user.birthDate, birthTime: input.user.birthTime, timeZoneId: tz };

  if (input.systemConfig.rulesetVersion !== "mock-v1") {
    throw new SanmeiError(SanmeiErrorCode.RULESET_VERSION_UNSUPPORTED, "未対応の rulesetVersion", {
      requested: input.systemConfig.rulesetVersion,
      supported: ["mock-v1"],
    });
  }

  const ruleset = deps.ruleset ?? bundledMockRulesetV1;

  const needTime = mapCalendarFailure(tz, () =>
    requiresBirthTimeForAnySolarTermOnDate(
      deps.solarTermStore,
      input.user.birthDate,
      input.user.birthTime,
      tz,
      deps.port,
    ),
  );

  if (needTime) {
    const hit = firstSolarTermMatchingBirthDate(deps.solarTermStore, input.user.birthDate, tz, deps.port);
    throw new SanmeiError(SanmeiErrorCode.TIME_REQUIRED_FOR_SOLAR_TERM, "節入り日前後のため出生時刻が必要です", {
      reason: "BIRTH_DATE_EQUALS_SOLAR_TERM_LOCAL_DAY",
      solarTerm: hit?.termId ?? null,
      solarTermInstantUtcMs: hit?.instantUtcMs ?? null,
    });
  }

  const l1 = mapCalendarFailure(tz, () =>
    resolveInsenWithDepth(birthWall, deps.solarTermStore, deps.port),
  );

  const zYear = resolveZokanForBranch(l1.year.branch, l1.displayDepth, ruleset);
  const zMonth = resolveZokanForBranch(l1.month.branch, l1.displayDepth, ruleset);
  const zDay = resolveZokanForBranch(l1.day.branch, l1.displayDepth, ruleset);

  const pillars = {
    year: { ...l1.year, zokan: zYear },
    month: { ...l1.month, zokan: zMonth },
    day: { ...l1.day, zokan: zDay },
  };

  const dayStem = l1.day.stem;
  const mainStars = resolveMainStars(dayStem, pillars, ruleset);
  const sub = resolveSubordinateStars(dayStem, l1.year.branch, l1.month.branch, l1.day.branch, ruleset);
  const { guardianDeities, kishin } = resolveGuardianKishin(dayStem, l1.month.branch, ruleset);
  const familyNodes = resolveFamilyNodes(dayStem, ruleset);

  const insenLayer2: InsenLayer2 = {
    ...pillars,
    displayDepth: l1.displayDepth,
    rawDelta: l1.rawDelta,
  };

  const energyData = resolveEnergyData(insenLayer2, ruleset);
  const destinyBugs = resolveDestinyBugs(insenLayer2, ruleset);

  const calculatedAt = new Date(deps.nowUtcMs ?? Date.now()).toISOString();

  return {
    meta: {
      engineVersion: packageVersion,
      rulesetVersion: input.systemConfig.rulesetVersion,
      sect: input.systemConfig.sect,
      calculatedAt,
    },
    baseProfile: {
      insen: {
        year: { stem: l1.year.stem, branch: l1.year.branch, zokan: zYear },
        month: { stem: l1.month.stem, branch: l1.month.branch, zokan: zMonth },
        day: { stem: l1.day.stem, branch: l1.day.branch, zokan: zDay },
        displayDepth: l1.displayDepth,
        rawDelta: l1.rawDelta,
      },
      yousen: {
        mainStars,
        subordinateStars: [
          { anchor: "YEAR_BRANCH", starId: sub.yearBranch },
          { anchor: "MONTH_BRANCH", starId: sub.monthBranch },
          { anchor: "DAY_BRANCH", starId: sub.dayBranch },
        ],
      },
      familyNodes,
      energyData,
      destinyBugs,
    },
    interactionRules: {
      guardianDeities,
      kishin,
    },
  };
}
