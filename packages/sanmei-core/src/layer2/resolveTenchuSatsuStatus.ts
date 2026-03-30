import type { Branch, Stem } from "../layer1/enums.js";
import type { BundledRuleset, TenchuRulesB2 } from "../schemas/rulesetMockV1.js";
import type { AnnualTimeline, DaiunTimeline, DestinyBugCode, InsenLayer2 } from "../schemas/layer2.js";
import { pillarStemBranchKey } from "./stemBranchKey.js";

/**
 * 天中殺 B1: 宿命テーブル照合の機械出力（`destinyBugRules`）。動的条件は B2。
 * 主入力は insen + ruleset。`destinyBugs` は read-only スナップショット。
 */
export function resolveTenchuSatsuStatusB1(
  insen: InsenLayer2,
  ruleset: BundledRuleset,
  destinyBugs: DestinyBugCode[],
): Record<string, unknown> {
  const y = pillarStemBranchKey(insen.year.stem as Stem, insen.year.branch as Branch);
  const m = pillarStemBranchKey(insen.month.stem as Stem, insen.month.branch as Branch);
  const d = pillarStemBranchKey(insen.day.stem as Stem, insen.day.branch as Branch);
  const r = ruleset.destinyBugRules;
  return {
    sourceLevel: "L2_SECONDARY",
    phase: "B1_NATAL_RULES_TABLE",
    natal: {
      yearPillarKey: y,
      monthPillarKey: m,
      dayPillarKey: d,
      listedInShukumeiTenchusatsuYear: r.shukumeiTenchusatsuYear.includes(y),
      listedInShukumeiTenchusatsuMonth: r.shukumeiTenchusatsuMonth.includes(m),
      listedInAbnormalKanshiNormal: r.abnormalKanshiNormal.includes(d),
      listedInAbnormalKanshiDark: r.abnormalKanshiDark.includes(d),
    },
    destinyBugs,
  };
}

/** 天中殺 B2: `tenchuRules.b2`（research-tenchu-b2-v1）に基づく年運・大運 index 照合。 */
export function resolveTenchuSatsuStatusB2(
  b2: TenchuRulesB2,
  timeline: { annual: AnnualTimeline; daiun: DaiunTimeline },
): Record<string, unknown> {
  const { annual, daiun } = timeline;
  const cur = daiun.currentPhase;
  const idxAnn = annual.sexagenaryIndex;
  const idxDaiun = cur.sexagenaryIndex;
  const setAnn = new Set(b2.annual.activeWhenSexagenaryIndexIn);
  const setDaiun = new Set(b2.daiun.activeWhenCurrentPhaseSexagenaryIndexIn);
  return {
    dslVersion: b2.dslVersion,
    sourceLevel: b2.sourceLevel,
    calendarYear: annual.calendarYear,
    annualSexagenaryIndex: idxAnn,
    daiunCurrentPhaseIndex: cur.phaseIndex,
    daiunCurrentPhaseSexagenaryIndex: idxDaiun,
    annualTenchuWindowActive: setAnn.has(idxAnn),
    daiunPhaseTenchuWindowActive: setDaiun.has(idxDaiun),
  };
}

/** 研究系: B1 + 任意の B2（`tenchuRules.b2` があるとき）をマージ。 */
export function resolveTenchuSatsuStatus(
  insen: InsenLayer2,
  ruleset: BundledRuleset,
  destinyBugs: DestinyBugCode[],
  timeline: { annual: AnnualTimeline; daiun: DaiunTimeline },
): Record<string, unknown> {
  const b1 = resolveTenchuSatsuStatusB1(insen, ruleset, destinyBugs);
  const b2cfg = ruleset.tenchuRules?.b2;
  if (!b2cfg) {
    return b1;
  }
  const dynamic = resolveTenchuSatsuStatusB2(b2cfg, timeline);
  return {
    ...b1,
    phase: "B2_DYNAMIC",
    dynamic,
  };
}
