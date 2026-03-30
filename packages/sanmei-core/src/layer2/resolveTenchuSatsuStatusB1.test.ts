import { describe, expect, it } from "vitest";
import type { InsenLayer2 } from "../schemas/layer2.js";
import type { BundledRuleset } from "../schemas/rulesetMockV1.js";
import { getBranchIdFromChar, getStemIdFromChar } from "./stemBranchKey.js";
import { getBundledRuleset } from "./bundledRulesets.js";
import { RESEARCH_DESTINY_BUG_RULES_SUBSET } from "./researchDestinyBugRulesSubset.js";
import { resolveTenchuSatsuStatusB1 } from "./resolveTenchuSatsuStatus.js";

function insenFromPillarKeys(yearKey: string, monthKey: string, dayKey: string): InsenLayer2 {
  const zokan = {
    zoukanShogen: 0,
    zoukanChugen: 0,
    zoukanHongen: 0,
    activeSlot: "ZOUKAN_SHOGEN" as const,
    activeStem: 0,
  };
  const pillar = (key: string) => {
    const ch = [...key];
    if (ch.length !== 2) throw new Error(`expected pillar key, got ${key}`);
    return {
      stem: getStemIdFromChar(ch[0]!),
      branch: getBranchIdFromChar(ch[1]!),
      zokan,
    };
  };
  return {
    year: pillar(yearKey),
    month: pillar(monthKey),
    day: pillar(dayKey),
    displayDepth: 1,
    rawDelta: 0,
  };
}

describe("resolveTenchuSatsuStatusB1（座標付きゴールデン）", () => {
  const baseRuleset: BundledRuleset = {
    ...getBundledRuleset("mock-v1"),
    destinyBugRules: RESEARCH_DESTINY_BUG_RULES_SUBSET,
  };

  it("年柱キーが shukumeiTenchusatsuYear に含まれると natal フラグが true", () => {
    const insen = insenFromPillarKeys("戊辰", "丙寅", "庚子");
    const out = resolveTenchuSatsuStatusB1(insen, baseRuleset, []);
    const natal = out.natal as Record<string, unknown>;
    expect(natal.yearPillarKey).toBe("戊辰");
    expect(natal.listedInShukumeiTenchusatsuYear).toBe(true);
    expect(natal.listedInShukumeiTenchusatsuMonth).toBe(false);
    expect(natal.listedInAbnormalKanshiNormal).toBe(false);
    expect(natal.listedInAbnormalKanshiDark).toBe(false);
  });

  it("年柱キーがリストに無いとき shukumei 年は false", () => {
    const insen = insenFromPillarKeys("甲子", "壬午", "癸酉");
    const out = resolveTenchuSatsuStatusB1(insen, baseRuleset, []);
    const natal = out.natal as Record<string, unknown>;
    expect(natal.yearPillarKey).toBe("甲子");
    expect(natal.listedInShukumeiTenchusatsuYear).toBe(false);
  });

  it("月柱キーが shukumeiTenchusatsuMonth に一致すると月フラグが true", () => {
    const insen = insenFromPillarKeys("丙寅", "壬午", "庚子");
    const out = resolveTenchuSatsuStatusB1(insen, baseRuleset, []);
    const natal = out.natal as Record<string, unknown>;
    expect(natal.monthPillarKey).toBe("壬午");
    expect(natal.listedInShukumeiTenchusatsuMonth).toBe(true);
  });

  it("日柱キーが abnormalKanshiNormal / Dark で照合される", () => {
    const hitNormal = insenFromPillarKeys("丙寅", "丁卯", "甲子");
    const o1 = resolveTenchuSatsuStatusB1(hitNormal, baseRuleset, []);
    const n1 = o1.natal as Record<string, unknown>;
    expect(n1.dayPillarKey).toBe("甲子");
    expect(n1.listedInAbnormalKanshiNormal).toBe(true);
    expect(n1.listedInAbnormalKanshiDark).toBe(false);

    const hitDark = insenFromPillarKeys("丙寅", "丁卯", "庚申");
    const o2 = resolveTenchuSatsuStatusB1(hitDark, baseRuleset, []);
    const n2 = o2.natal as Record<string, unknown>;
    expect(n2.dayPillarKey).toBe("庚申");
    expect(n2.listedInAbnormalKanshiNormal).toBe(false);
    expect(n2.listedInAbnormalKanshiDark).toBe(true);
  });

  it("phase・sourceLevel・destinyBugs の受け渡し", () => {
    const insen = insenFromPillarKeys("戊辰", "壬午", "甲子");
    const bugs = ["SHUKUMEI_TENCHUSATSU_YEAR"] as const;
    const out = resolveTenchuSatsuStatusB1(insen, baseRuleset, [...bugs]);
    expect(out.phase).toBe("B1_NATAL_RULES_TABLE");
    expect(out.sourceLevel).toBe("L2_SECONDARY");
    expect(out.destinyBugs).toEqual([...bugs]);
  });
});
