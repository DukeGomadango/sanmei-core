import type { Stem } from "./enums.js";

/** 五虎遁: 年干グループ → 寅月の天干（0=甲…） */
const WU_HU_DUN_YIN_MONTH_STEM: readonly Stem[] = [2, 4, 6, 8, 0];
// 甲己→丙 乙庚→戊 丙辛→庚 丁壬→壬 戊癸→甲

export function wuHuDunFirstMonthStem(yearStem: Stem): Stem {
  return WU_HU_DUN_YIN_MONTH_STEM[yearStem % 5]!;
}

/**
 * 月支（子=0…）が分かっているときの月干。寅月を基準に干支が進む。
 * monthBranch: 節月の地支インデックス
 */
export function monthStemFromYearAndBranch(yearStem: Stem, monthBranch: number): Stem {
  const base = wuHuDunFirstMonthStem(yearStem);
  const offset = (monthBranch - 2 + 12) % 12;
  return ((base + offset) % 10) as Stem;
}
