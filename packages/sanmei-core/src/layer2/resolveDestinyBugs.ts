import type { Branch, Stem } from "../layer1/enums.js";
import type { DestinyBugCode, InsenLayer2 } from "../schemas/layer2.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import { pillarStemBranchKey } from "./stemBranchKey.js";

/**
 * 宿命系フラグ（出生時固定）。年／月は該当リスト、異常干支は日柱を ruleset 表と照合。
 * 重複コードは Zod の destinyBugs フィールドでユニーク化する。
 */
export function resolveDestinyBugs(insen: InsenLayer2, ruleset: BundledRuleset): DestinyBugCode[] {
  const out: DestinyBugCode[] = [];
  const y = pillarStemBranchKey(insen.year.stem as Stem, insen.year.branch as Branch);
  const m = pillarStemBranchKey(insen.month.stem as Stem, insen.month.branch as Branch);
  const d = pillarStemBranchKey(insen.day.stem as Stem, insen.day.branch as Branch);
  const r = ruleset.destinyBugRules;
  if (r.shukumeiTenchusatsuYear.includes(y)) {
    out.push("SHUKUMEI_TENCHUSATSU_YEAR");
  }
  if (r.shukumeiTenchusatsuMonth.includes(m)) {
    out.push("SHUKUMEI_TENCHUSATSU_MONTH");
  }
  if (r.abnormalKanshiNormal.includes(d)) {
    out.push("IJOU_KANSHI_NORMAL");
  }
  if (r.abnormalKanshiDark.includes(d)) {
    out.push("IJOU_KANSHI_DARK");
  }
  return out;
}
