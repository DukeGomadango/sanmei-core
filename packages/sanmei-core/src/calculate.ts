import { createRequire } from "node:module";
import { ZodError } from "zod";
import { CalculateInputSchema } from "./schemas/calculateInput.js";
import type {
  CalculateResult,
  DynamicTimeline,
  InsenLayer2,
  InteractionRulesLayer2,
  TraceNode,
} from "./schemas/layer2.js";
import { SanmeiError, SanmeiErrorCode } from "./errors/sanmeiError.js";
import { requiresBirthTimeForAnySolarTermOnDate } from "./layer1/calendar/calendarBoundary.js";
import { resolveInsenWithDepth } from "./layer1/pillars.js";
import type { Branch } from "./layer1/enums.js";
import { indexToStemBranch } from "./layer1/sexagenary.js";
import type { SolarTermStore } from "./layer1/solarTerms/store.js";
import type { CalendarPort } from "./layer1/calendar/types.js";
import type { BundledRuleset } from "./schemas/rulesetMockV1.js";
import { getBundledRuleset, isBundledRulesetVersion, BUNDLED_RULESET_VERSIONS } from "./layer2/bundledRulesets.js";
import { resolveZokanForBranch } from "./layer2/resolveZokan.js";
import { resolveSubordinateStars } from "./layer2/resolveSubordinateStars.js";
import { resolveGuardianKishin } from "./layer2/resolveGuardianKishin.js";
import { resolveMainStars } from "./layer2/resolveMainStars.js";
import { resolveFamilyNodes } from "./layer2/resolveFamilyNodes.js";
import { resolveEnergyData } from "./layer2/resolveEnergyData.js";
import { resolveDestinyBugs } from "./layer2/resolveDestinyBugs.js";
import { resolveDynamicTimeline } from "./layer2/resolveDynamicTimeline.js";
import { applyLayer3aByRuleset, resolveResearchTimelinePairInteractions } from "./layer2/applyLayer3Mock.js";
import { applyLayer3bByRuleset } from "./layer2/applyLayer3b.js";

const require = createRequire(import.meta.url);
const { version: packageVersion } = require("../package.json") as { version: string };

export type CalculateDeps = {
  solarTermStore: SolarTermStore;
  port: CalendarPort;
  ruleset?: BundledRuleset;
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

function attachDaiunPhaseInteractions(
  timeline: DynamicTimeline,
  insen: InsenLayer2,
  ruleset: BundledRuleset,
): DynamicTimeline {
  if (ruleset.meta.rulesetVersion !== "research-v1") return timeline;
  const phases = timeline.daiun.phases.map((phase) => {
    const fortune = indexToStemBranch(phase.sexagenaryIndex);
    const interactions = [
      ...resolveResearchTimelinePairInteractions(
        fortune.branch,
        insen.year.branch as Branch,
        "YEAR",
        phase.phaseIndex,
        ruleset,
      ),
      ...resolveResearchTimelinePairInteractions(
        fortune.branch,
        insen.month.branch as Branch,
        "MONTH",
        phase.phaseIndex,
        ruleset,
      ),
      ...resolveResearchTimelinePairInteractions(
        fortune.branch,
        insen.day.branch as Branch,
        "DAY",
        phase.phaseIndex,
        ruleset,
      ),
    ];
    return {
      ...phase,
      interactions,
    };
  });
  const currentPhase = phases.find((p) => p.phaseIndex === timeline.daiun.currentPhase.phaseIndex) ?? phases[0];
  return {
    ...timeline,
    daiun: {
      ...timeline.daiun,
      phases,
      currentPhase: currentPhase!,
    },
  };
}

/**
 * Layer1〜Layer3b までのオーケストレータ:
 * 入力検証 → 節入り日の時刻要否 → Layer1（深さ付）→ バンドル ruleset で L2a–c → dynamicTimeline（mock）→ Layer3a → Layer3b。
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

  if (!isBundledRulesetVersion(input.systemConfig.rulesetVersion)) {
    throw new SanmeiError(SanmeiErrorCode.RULESET_VERSION_UNSUPPORTED, "未対応の rulesetVersion", {
      requested: input.systemConfig.rulesetVersion,
      supported: [...BUNDLED_RULESET_VERSIONS],
    });
  }

  const ruleset =
    deps.ruleset ?? getBundledRuleset(input.systemConfig.rulesetVersion);
  if (ruleset.meta.rulesetVersion !== input.systemConfig.rulesetVersion) {
    throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, "deps.ruleset がリクエストの rulesetVersion と一致しません", {
      requested: input.systemConfig.rulesetVersion,
      depsMeta: ruleset.meta.rulesetVersion,
    });
  }

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
  const includeDebugTrace = input.options?.includeDebugTrace === true;
  const traceNodes: TraceNode[] = [];

  if (includeDebugTrace) {
    traceNodes.push({
      phase: "LAYER1",
      stepId: "resolveInsenWithDepth",
      ruleId: "layer1.depth-v1",
      inputs: {
        timeZone: tz,
        rulesetVersion: input.systemConfig.rulesetVersion,
      },
      result: {
        yearStem: l1.year.stem,
        yearBranch: l1.year.branch,
        monthStem: l1.month.stem,
        monthBranch: l1.month.branch,
        dayStem: l1.day.stem,
        dayBranch: l1.day.branch,
        rawDelta: l1.rawDelta,
        displayDepth: l1.displayDepth,
      },
      reasonCode: "SOLAR_TERM_LOCAL_DAY_DIFF",
    });
  }

  const zYear = resolveZokanForBranch(l1.year.branch, l1.displayDepth, ruleset);
  const zMonth = resolveZokanForBranch(l1.month.branch, l1.displayDepth, ruleset);
  const zDay = resolveZokanForBranch(l1.day.branch, l1.displayDepth, ruleset);

  if (includeDebugTrace) {
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveZokan.year",
      ruleId: `zokan.${l1.year.branch}`,
      inputs: {
        branch: l1.year.branch,
        displayDepth: l1.displayDepth,
      },
      result: {
        activeSlot: zYear.activeSlot,
        activeStem: zYear.activeStem,
      },
      reasonCode: "ZOKAN_DEPTH_TABLE_MATCH",
    });
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveZokan.month",
      ruleId: `zokan.${l1.month.branch}`,
      inputs: {
        branch: l1.month.branch,
        displayDepth: l1.displayDepth,
      },
      result: {
        activeSlot: zMonth.activeSlot,
        activeStem: zMonth.activeStem,
      },
      reasonCode: "ZOKAN_DEPTH_TABLE_MATCH",
    });
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveZokan.day",
      ruleId: `zokan.${l1.day.branch}`,
      inputs: {
        branch: l1.day.branch,
        displayDepth: l1.displayDepth,
      },
      result: {
        activeSlot: zDay.activeSlot,
        activeStem: zDay.activeStem,
      },
      reasonCode: "ZOKAN_DEPTH_TABLE_MATCH",
    });
  }

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

  if (includeDebugTrace) {
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveMainStars",
      ruleId: "mainStars.dayStemByTarget",
      inputs: {
        dayStem,
      },
      result: {
        head: mainStars[0]?.starId ?? "NA",
        chest: mainStars[1]?.starId ?? "NA",
        belly: mainStars[2]?.starId ?? "NA",
        rightHand: mainStars[3]?.starId ?? "NA",
        leftHand: mainStars[4]?.starId ?? "NA",
      },
      reasonCode: "MATRIX_LOOKUP",
    });
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveSubordinateStars",
      ruleId: "subordinateStars.dayStemByBranch",
      inputs: {
        dayStem,
        yearBranch: l1.year.branch,
        monthBranch: l1.month.branch,
        dayBranch: l1.day.branch,
      },
      result: {
        yearBranch: sub.yearBranch,
        monthBranch: sub.monthBranch,
        dayBranch: sub.dayBranch,
      },
      reasonCode: "MATRIX_LOOKUP",
    });
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveGuardianKishin",
      ruleId: "guardianKishin.dayStemByMonthBranch",
      inputs: {
        dayStem,
        monthBranch: l1.month.branch,
      },
      result: {
        guardianDeities,
        kishin,
      },
      reasonCode: "RULESET_MATCH",
    });
  }

  const insenLayer2: InsenLayer2 = {
    ...pillars,
    displayDepth: l1.displayDepth,
    rawDelta: l1.rawDelta,
  };

  const energyData = resolveEnergyData(insenLayer2, ruleset);
  const destinyBugs = resolveDestinyBugs(insenLayer2, ruleset);

  if (includeDebugTrace) {
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveEnergyData",
      ruleId: "energyMock.weights",
      inputs: {
        displayDepth: l1.displayDepth,
      },
      result: {
        totalEnergy: energyData.totalEnergy,
        actionAreaSize: energyData.actionAreaSize,
        areaRatioPermille: energyData.actionAreaGeometry.areaRatioPermille,
      },
      reasonCode: "ENERGY_RULE_APPLIED",
    });
    traceNodes.push({
      phase: "LAYER2",
      stepId: "resolveDestinyBugs",
      ruleId: "destinyBugRules",
      inputs: {
        dayStem: l1.day.stem,
        dayBranch: l1.day.branch,
      },
      result: {
        codes: destinyBugs,
      },
      reasonCode: "DESTINY_RULE_MATCH",
    });
  }

  const dynamicTimeline = mapCalendarFailure(tz, () =>
    resolveDynamicTimeline(
      input.user,
      input.context,
      insenLayer2,
      ruleset,
      deps.solarTermStore,
      deps.port,
    ),
  );
  if (includeDebugTrace) {
    const researchRuleId = ruleset.meta.rulesetVersion === "research-v1" ? ruleset.researchDaiun?.ruleIds.start ?? null : null;
    traceNodes.push({
      phase: "LAYER3",
      stepId: "resolveDynamicTimeline",
      ruleId: researchRuleId ?? "timelineMock.fixedStartAge",
      inputs: {
        asOf: input.context.asOf,
        sourceLevel: ruleset.researchDaiun?.sourceLevel ?? "L3_UNVERIFIED",
      },
      result: {
        startAge: dynamicTimeline.daiun.startAge,
        currentPhaseIndex: dynamicTimeline.daiun.currentPhase.phaseIndex,
        annualYear: dynamicTimeline.annual.calendarYear,
        direction: dynamicTimeline.daiun.direction ?? "forward",
        startDayDiff: dynamicTimeline.daiun.startDayDiff ?? -1,
        roundedStartAge: dynamicTimeline.daiun.startAge,
      },
      reasonCode: "TIMELINE_RULE_APPLIED",
    });
  }

  let interactionRules: InteractionRulesLayer2 = {
    guardianDeities,
    kishin,
    isouhou: [],
    kyoki: null,
  };
  interactionRules = applyLayer3aByRuleset(interactionRules, ruleset, {
    insen: insenLayer2,
    dynamicTimeline,
  });
  interactionRules = applyLayer3bByRuleset(interactionRules, ruleset, {
    allowGohouInKaku: input.systemConfig.allowGohouInKaku,
  });
  const dynamicTimelineWithInteractions = attachDaiunPhaseInteractions(dynamicTimeline, insenLayer2, ruleset);
  if (includeDebugTrace) {
    interactionRules.debugTrace = {
      traceVersion: 1,
      nodes: traceNodes,
    };
  }

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
    dynamicTimeline: dynamicTimelineWithInteractions,
    interactionRules,
  };
}
