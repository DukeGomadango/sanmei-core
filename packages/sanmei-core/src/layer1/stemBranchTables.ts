import type { Element } from "./enums.js";
import { Branch, Stem, YinYang } from "./enums.js";

/** 十干 → 五行・陰陽（DOMAIN-GLOSSARY §1.3） */
export const STEM_ELEMENT: readonly Element[] = [
  0, 0, 1, 1, 2, 2, 3, 3, 4, 4,
] as const; // 甲乙木 丙丁火 戊己土 庚辛金 壬癸水

export const STEM_YINYANG: readonly YinYang[] = [
  YinYang.YANG,
  YinYang.YIN,
  YinYang.YANG,
  YinYang.YIN,
  YinYang.YANG,
  YinYang.YIN,
  YinYang.YANG,
  YinYang.YIN,
  YinYang.YANG,
  YinYang.YIN,
];

/** 十二支 → 地支五行（簡易・本気ベース。DOMAIN-GLOSSARY §1.4） */
export const BRANCH_ELEMENT: readonly Element[] = [
  4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4,
] as const;

const STEM_LABELS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCH_LABELS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export function stemLabel(s: Stem): string {
  return STEM_LABELS[s];
}

export function branchLabel(b: Branch): string {
  return BRANCH_LABELS[b];
}

export function stemFromLabel(kanji: string): Stem | undefined {
  const i = STEM_LABELS.indexOf(kanji as (typeof STEM_LABELS)[number]);
  return i >= 0 ? (i as Stem) : undefined;
}

export function branchFromLabel(kanji: string): Branch | undefined {
  const i = BRANCH_LABELS.indexOf(kanji as (typeof BRANCH_LABELS)[number]);
  return i >= 0 ? (i as Branch) : undefined;
}
