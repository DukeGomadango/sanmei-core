import { describe, expect, it } from "vitest";
import {
  ACADEMY_MAIN_KANJI,
  ACADEMY_MAIN_NUMERIC,
  MAIN_STAR_NUM_TO_BASE,
  academySubStarRawKanji,
  normalizeSubStarKanjiForDiff,
} from "./researchStarTables.js";

/**
 * 算命学アカデミー（2018）十大主星の数値表・漢字表の整合と、
 * アカデミー×小山清水大師の十二大従星 120 セル突合（Iteration 29）。
 * 表データの正本は `researchStarTables.ts`。
 */

/** 第二ソース: 算命学Z塾「十大主星の基本情報」表の並び（1〜10 に対応する基底名）。https://sanmeido.com/zyudaisyusei/ */
const TEN_MAIN_STAR_BASE_NAMES_ZJYUKU_ORDER: string[] = [
  "貫索",
  "石門",
  "鳳閣",
  "調舒",
  "禄存",
  "司禄",
  "車騎",
  "牽牛",
  "龍高",
  "玉堂",
];

/** 小山: 行 子..亥（0..11）／列 甲..癸（0..9）。 simplify 記号ゆれあり。 */
const OYAMA_SUB_KANJI: string[][] = [
  ["天恍星", "天胡星", "天报星", "天驰星", "天报星", "天驰星", "天极星", "天贵星", "天将星", "天禄星"],
  ["天南星", "天堂星", "天印星", "天库星", "天印星", "天库星", "天库星", "天印星", "天堂星", "天南星"],
  ["天緑星", "天将星", "天贵星", "天极星", "天贵星", "天极星", "天驰星", "天报星", "天胡星", "天恍星"],
  ["天将星", "天緑星", "天恍星", "天胡星", "天恍星", "天胡星", "天报星", "天驰星", "天极星", "天贵星"],
  ["天堂星", "天南星", "天南星", "天堂星", "天南星", "天印星", "天印星", "天库星", "天库星", "天印星"],
  ["天胡星", "天恍星", "天禄星", "天将星", "天禄星", "天将星", "天贵星", "天极星", "天驰星", "天报星"],
  ["天极星", "天贵星", "天将星", "天禄星", "天将星", "天禄星", "天恍星", "天胡星", "天报星", "天驰星"],
  ["天库星", "天印星", "天堂星", "天南星", "天堂星", "天南星", "天南星", "天堂星", "天印星", "天库星"],
  ["天驰星", "天报星", "天胡星", "天恍星", "天胡星", "天恍星", "天禄星", "天将星", "天贵星", "天星星"],
  ["天报星", "天驰星", "天极星", "天贵星", "天极星", "天贵星", "天将星", "天禄星", "天恍星", "天胡星"],
  ["天印星", "天库星", "天印星", "天印星", "天库星", "天印星", "天堂星", "天南星", "天南星", "天堂星"],
  ["天贵星", "天极星", "天报星", "天报星", "天驰星", "天报星", "天胡星", "天恍星", "天禄星", "天将星"],
];

const SUB_STAR_KNOWN_DIVERGENCES = new Set<string>([
  "4-5",
  "8-9",
  "10-2",
  "11-2",
]);

function expectPermutation1To10(values: number[]): void {
  const sorted = [...values].sort((a, b) => a - b);
  expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
}

describe("researchStarMatrixDiff (Iteration 29)", () => {
  it("主星: 算命学Z塾の1〜10星名順がアカデミー数値1..10の基底名と一致（第二ソース・命名）", () => {
    for (let id = 1; id <= 10; id++) {
      expect(TEN_MAIN_STAR_BASE_NAMES_ZJYUKU_ORDER[id - 1]).toBe(MAIN_STAR_NUM_TO_BASE[id]);
    }
  });

  it("アカデミー十大主星: 数値表の各行・各列が 1..10 の置換（決定表のLatin構造）", () => {
    for (let r = 0; r < 10; r++) {
      expectPermutation1To10(ACADEMY_MAIN_NUMERIC[r]!);
    }
    for (let c = 0; c < 10; c++) {
      const col = ACADEMY_MAIN_NUMERIC.map((row) => row[c]!);
      expectPermutation1To10(col);
    }
  });

  it("アカデミー十大主星: 数値表が 1..10 のみかつ漢字表と整合", () => {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const n = ACADEMY_MAIN_NUMERIC[r]![c]!;
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
        const kanji = ACADEMY_MAIN_KANJI[r]![c]!.replace(/星$/, "");
        const base = MAIN_STAR_NUM_TO_BASE[n];
        expect(kanji).toBe(base);
      }
    }
  });

  it("十二大従星: アカデミー×小山は正規化後 116/120 一致、差分 4 セルは既知（S1 相違・小山誤表記）", () => {
    let mismatch = 0;
    const detail: string[] = [];
    for (let b = 0; b < 12; b++) {
      for (let s = 0; s < 10; s++) {
        const a = normalizeSubStarKanjiForDiff(academySubStarRawKanji(b, s));
        const o = normalizeSubStarKanjiForDiff(OYAMA_SUB_KANJI[b]![s]!);
        if (a !== o) {
          mismatch++;
          const key = `${b}-${s}`;
          const stemNames = "甲乙丙丁戊己庚辛壬癸";
          const brNames = "子丑寅卯辰巳午未申酉戌亥";
          detail.push(`${key} 支${brNames[b]!}干${stemNames[s]!} academy=${a} oyama=${o}`);
          expect(SUB_STAR_KNOWN_DIVERGENCES.has(key)).toBe(true);
        }
      }
    }
    expect(mismatch).toBe(SUB_STAR_KNOWN_DIVERGENCES.size);
    expect(detail.some((d) => d.includes("申") && d.includes("癸"))).toBe(true);
  });
});
