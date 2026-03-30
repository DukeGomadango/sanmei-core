/**
 * 算命学アカデミー（2018）公開表ベースの主星・従星漢字表（研究用 L2_SECONDARY）。
 * `MA_日干index_照合干index` / `SU_日干index_地支index`（mock-v1 行列と同じ index 規約）へ写像する。
 */

/** アカデミー表の行・列はいずれも「癸, 甲, …, 壬」の順（インデックス 0..9） */
export const ACADEMY_MAIN_KANJI: string[][] = [
  ["貫索星", "玉堂星", "龍高星", "牽牛星", "車騎星", "司禄星", "禄存星", "調舒星", "鳳閣星", "石門星"],
  ["調舒星", "貫索星", "石門星", "龍高星", "玉堂星", "車騎星", "牽牛星", "禄存星", "司禄星", "鳳閣星"],
  ["鳳閣星", "石門星", "貫索星", "玉堂星", "龍高星", "牽牛星", "車騎星", "司禄星", "禄存星", "調舒星"],
  ["司禄星", "鳳閣星", "調舒星", "貫索星", "石門星", "龍高星", "玉堂星", "車騎星", "牽牛星", "禄存星"],
  ["禄存星", "調舒星", "鳳閣星", "石門星", "貫索星", "玉堂星", "龍高星", "牽牛星", "車騎星", "司禄星"],
  ["牽牛星", "禄存星", "司禄星", "鳳閣星", "調舒星", "貫索星", "石門星", "龍高星", "玉堂星", "車騎星"],
  ["車騎星", "司禄星", "禄存星", "調舒星", "鳳閣星", "石門星", "貫索星", "玉堂星", "龍高星", "牽牛星"],
  ["玉堂星", "車騎星", "牽牛星", "禄存星", "司禄星", "鳳閣星", "調舒星", "貫索星", "石門星", "龍高星"],
  ["龍高星", "牽牛星", "車騎星", "司禄星", "禄存星", "調舒星", "鳳閣星", "石門星", "貫索星", "玉堂星"],
  ["石門星", "龍高星", "玉堂星", "車騎星", "牽牛星", "禄存星", "司禄星", "鳳閣星", "調舒星", "貫索星"],
];

export const ACADEMY_MAIN_NUMERIC: number[][] = [
  [1, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  [4, 1, 2, 9, 10, 7, 8, 5, 6, 3],
  [3, 2, 1, 10, 9, 8, 7, 6, 5, 4],
  [6, 3, 4, 1, 2, 9, 10, 7, 8, 5],
  [5, 4, 3, 2, 1, 10, 9, 8, 7, 6],
  [8, 5, 6, 3, 4, 1, 2, 9, 10, 7],
  [7, 6, 5, 4, 3, 2, 1, 10, 9, 8],
  [10, 7, 8, 5, 6, 3, 4, 1, 2, 9],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 10],
  [2, 9, 10, 7, 8, 5, 6, 3, 4, 1],
];

export const MAIN_STAR_NUM_TO_BASE: Record<number, string> = {
  1: "貫索",
  2: "石門",
  3: "鳳閣",
  4: "調舒",
  5: "禄存",
  6: "司禄",
  7: "車騎",
  8: "牽牛",
  9: "龍高",
  10: "玉堂",
};

/** 行は 亥,子,丑,…,戌（支 index 11,0,1,…,10）／列は 癸,甲,…,壬（干 index 9,0,…,8） */
export const ACADEMY_SUB_ROWS_BRANCH: number[] = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const ACADEMY_SUB_COLS_STEM: number[] = [9, 0, 1, 2, 3, 4, 5, 6, 7, 8];

export const ACADEMY_SUB_KANJI: string[][] = [
  ["天将星", "天贵星", "天极星", "天驰星", "天报星", "天驰星", "天报星", "天胡星", "天洸星", "天禄星"],
  ["天禄星", "天洸星", "天胡星", "天报星", "天驰星", "天报星", "天驰星", "天极星", "天贵星", "天将星"],
  ["天南星", "天南星", "天堂星", "天印星", "天库星", "天印星", "天库星", "天库星", "天印星", "天堂星"],
  ["天洸星", "天禄星", "天将星", "天贵星", "天极星", "天贵星", "天极星", "天驰星", "天报星", "天胡星"],
  ["天贵星", "天将星", "天禄星", "天洸星", "天胡星", "天洸星", "天胡星", "天报星", "天驰星", "天极星"],
  ["天印星", "天堂星", "天南星", "天南星", "天堂星", "天南星", "天堂星", "天印星", "天库星", "天库星"],
  ["天报星", "天胡星", "天洸星", "天禄星", "天将星", "天禄星", "天将星", "天贵星", "天极星", "天驰星"],
  ["天驰星", "天极星", "天贵星", "天将星", "天禄星", "天将星", "天禄星", "天洸星", "天胡星", "天报星"],
  ["天库星", "天库星", "天印星", "天堂星", "天南星", "天堂星", "天南星", "天南星", "天堂星", "天印星"],
  ["天极星", "天驰星", "天报星", "天胡星", "天洸星", "天胡星", "天洸星", "天禄星", "天将星", "天贵星"],
  ["天胡星", "天报星", "天驰星", "天极星", "天贵星", "天极星", "天贵星", "天将星", "天禄星", "天洸星"],
  ["天堂星", "天印星", "天库星", "天库星", "天印星", "天库星", "天印星", "天堂星", "天南星", "天南星"],
];

/** 十干 index（甲=0…癸=9）をアカデミー主星表の行 index（癸=0）へ */
function stemIdToAcademyMainRow(stemId: number): number {
  return (stemId + 1) % 10;
}

/** 照合干 index 同上 → 列 index */
function stemIdToAcademyMainCol(stemId: number): number {
  return (stemId + 1) % 10;
}

export function academySubStarRawKanji(branchStd: number, dayStemStd: number): string {
  const row = ACADEMY_SUB_ROWS_BRANCH.indexOf(branchStd);
  const col = ACADEMY_SUB_COLS_STEM.indexOf(dayStemStd);
  if (row < 0 || col < 0) throw new Error(`bad index branch=${branchStd} stem=${dayStemStd}`);
  return ACADEMY_SUB_KANJI[row]![col]!;
}

/** 従星: 比較用（末尾「星」除去＋ 18.10.1）。`researchStarMatrixDiff` 突合で使用。 */
export function normalizeSubStarKanjiForDiff(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/星$/, "")
    .replaceAll("天洸", "天恍")
    .replaceAll("天緑", "天禄")
    .replaceAll("天報", "天报")
    .replaceAll("竜高", "龍高")
    .replaceAll("天極", "天极")
    .replaceAll("天馳", "天驰")
    .replaceAll("天庫", "天库")
    .replaceAll("天貴", "天贵");
}

/** WORKFLOW 18.10.1 相当。基底名に正規化後、`星` を付け直す。 */
export function normalizeResearchSubStarDisplay(rawWithStar: string): string {
  return `${normalizeSubStarKanjiForDiff(rawWithStar)}星`;
}

/**
 * mock の `MA_日干a_照合干b` に対する研究用表示ラベル（アカデミー漢字表、末尾「星」）。
 * @param dayStemId 日干 甲=0…癸=9
 * @param targetStemId 照合干 同上
 */
export function researchMainStarLabelForIds(dayStemId: number, targetStemId: number): string {
  const r = stemIdToAcademyMainRow(dayStemId);
  const c = stemIdToAcademyMainCol(targetStemId);
  return ACADEMY_MAIN_KANJI[r]![c]!;
}

/**
 * mock の `SU_日干a_支b`（支 子=0…亥=11）に対する研究用表示ラベル。
 */
export function researchSubStarLabelForIds(dayStemId: number, branchStd: number): string {
  const raw = academySubStarRawKanji(branchStd, dayStemId);
  return normalizeResearchSubStarDisplay(raw);
}
