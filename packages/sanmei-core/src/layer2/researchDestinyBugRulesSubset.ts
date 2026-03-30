import type { BundledRuleset } from "../schemas/rulesetMockV1.js";

/**
 * research-v1 / research-experimental-v1 のみにマージする `destinyBugRules` サブセット（L2_SECONDARY）。
 * mock-v1.json 本文は空のまま。出典・全面監修は RESEARCH-SECT-RULESET-WORKFLOW 18.10.2・OPEN-QUESTIONS 論点8。
 */
export const RESEARCH_DESTINY_BUG_RULES_SUBSET: BundledRuleset["destinyBugRules"] = {
  shukumeiTenchusatsuYear: ["戊辰", "甲戌"],
  shukumeiTenchusatsuMonth: ["壬午"],
  abnormalKanshiNormal: ["甲子", "己卯"],
  abnormalKanshiDark: ["庚申"],
};
