/**
 * 年柱: 1984 立春後の太陽年を 甲子 (index 0) とする簡易アンカー。
 * （実務の文献と±1年の取り違えがあれば ruleset / メタで調整）
 */
export const YEAR_PILLAR_ANCHOR_SOLAR_YEAR = 1984;
export const YEAR_PILLAR_ANCHOR_INDEX = 0;

/**
 * 日柱: JDN に加算して mod 60 → 六十甲子 index（0=甲子）。
 * キャリブレーション: 2024-02-10 = 甲辰日 (index 40) で一致。
 */
/** 2024-02-10 甲辰 (index 40) で検証 */
export const DAY_PILLAR_JDN_ADDEND = 49;

/**
 * 節入り当日のローカル暦日を「1日目」と数えるオフセット（IMPLEMENTATION §5.0）。
 * displayDepth = (JDN_birth - JDN_term) + SOLAR_TERM_DAY_ZERO_INDEXING
 */
export const SOLAR_TERM_DAY_ZERO_INDEXING = 1;
