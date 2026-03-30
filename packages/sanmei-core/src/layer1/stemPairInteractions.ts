import type { Branch, Stem } from "./enums.js";
import { keTarget } from "./wuxingRelations.js";
import { STEM_ELEMENT, STEM_YINYANG } from "./stemBranchTables.js";
import { areKangoPair } from "./kango.js";

/** 地支の対冲（子午・丑未・寅申・卯酉・辰戌・巳亥） */
const CHONG_PAIRS: ReadonlyArray<readonly [Branch, Branch]> = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
];

export function areBranchesChong(a: Branch, b: Branch): boolean {
  if (a === b) return false;
  for (const [x, y] of CHONG_PAIRS) {
    if ((a === x && b === y) || (a === y && b === x)) return true;
  }
  return false;
}

/**
 * 天剋（天干が陰陽一致かつ五行の相剋）。天剋地冲の天干部に用いる。
 * 例: 甲陽木が戊陽土を克す（keTarget(WOOD)===EARTH）。
 */
export function areStemsTenkokuPair(a: Stem, b: Stem): boolean {
  if (a === b) return false;
  if (STEM_YINYANG[a] !== STEM_YINYANG[b]) return false;
  const ea = STEM_ELEMENT[a];
  const eb = STEM_ELEMENT[b];
  return keTarget(ea) === eb || keTarget(eb) === ea;
}

export { areKangoPair };
