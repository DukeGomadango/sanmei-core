import type { Branch, Stem } from "./enums.js";

/** 六十甲子の通し番号 0〜59（0=甲子） */
export type SexagenaryIndex = number;

/** 陽干は陽支のみ、陰干は陰支のみ → (stem,branch) は整合するか */
export function isValidStemBranchPair(stem: Stem, branch: Branch): boolean {
  return stem % 2 === branch % 2;
}

/** stem+branch → 0..59（甲子=0）。無効ペアは -1 */
export function stemBranchToIndex(stem: Stem, branch: Branch): SexagenaryIndex {
  if (!isValidStemBranchPair(stem, branch)) return -1;
  let n = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) {
      n = i;
      break;
    }
  }
  return n;
}

export function indexToStemBranch(index: SexagenaryIndex): { stem: Stem; branch: Branch } {
  const i = ((index % 60) + 60) % 60;
  return { stem: (i % 10) as Stem, branch: (i % 12) as Branch };
}

/** 次の干支（干支は 60 周期） */
export function nextIndex(index: SexagenaryIndex): SexagenaryIndex {
  return (((index % 60) + 1) % 60);
}
