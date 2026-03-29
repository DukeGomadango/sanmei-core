/**
 * 二十四節気（太陽視黄経、度）。立春=315° から 15° 刻み。
 * id は JSON 生成スクリプトと一致させる。
 */
export const SOLAR_TERM_IDS = [
  "lichun",
  "yushui",
  "jingzhe",
  "chunfen",
  "qingming",
  "guyu",
  "lixia",
  "xiaoman",
  "mangzhong",
  "xiazhi",
  "xiaoshu",
  "dashu",
  "liqiu",
  "chushu",
  "bailu",
  "qiufen",
  "hanlu",
  "shuangjiang",
  "lidong",
  "xiaoxue",
  "daxue",
  "dongzhi",
  "xiaohan",
  "dahan",
] as const;

export type SolarTermId = (typeof SOLAR_TERM_IDS)[number];

/** 各 id の黄経（度）。chunfen=0° */
export const SOLAR_TERM_LONGITUDE_DEG: Record<SolarTermId, number> = {
  lichun: 315,
  yushui: 330,
  jingzhe: 345,
  chunfen: 0,
  qingming: 15,
  guyu: 30,
  lixia: 45,
  xiaoman: 60,
  mangzhong: 75,
  xiazhi: 90,
  xiaoshu: 105,
  dashu: 120,
  liqiu: 135,
  chushu: 150,
  bailu: 165,
  qiufen: 180,
  hanlu: 195,
  shuangjiang: 210,
  lidong: 225,
  xiaoxue: 240,
  daxue: 255,
  dongzhi: 270,
  xiaohan: 285,
  dahan: 300,
};

/** 月支を決める「節」のみ（寅月=立春 …）。DOMAIN-GLOSSARY 節月 */
export const MONTH_START_TERM_IDS: readonly SolarTermId[] = [
  "lichun",
  "jingzhe",
  "qingming",
  "lixia",
  "mangzhong",
  "xiaoshu",
  "liqiu",
  "bailu",
  "hanlu",
  "lidong",
  "daxue",
  "xiaohan",
];

/**
 * MONTH_START_TERM_IDS と同じ並びの月支インデックス（子=0 … 亥=11）。
 * 寅月=立春 … 丑月=小寒
 */
export const MONTH_START_BRANCH_INDEX: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

export function monthBranchForStartTerm(termId: SolarTermId): number | undefined {
  const i = MONTH_START_TERM_IDS.indexOf(termId as (typeof MONTH_START_TERM_IDS)[number]);
  if (i < 0) return undefined;
  return MONTH_START_BRANCH_INDEX[i]!;
}
