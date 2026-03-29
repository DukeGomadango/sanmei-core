/** 陰陽 */
export const YinYang = {
  YIN: 0,
  YANG: 1,
} as const;
export type YinYang = (typeof YinYang)[keyof typeof YinYang];

/** 五行 */
export const Element = {
  WOOD: 0,
  FIRE: 1,
  EARTH: 2,
  METAL: 3,
  WATER: 4,
} as const;
export type Element = (typeof Element)[keyof typeof Element];

/** 十干（0=甲 … 9=癸） */
export const Stem = {
  JIA: 0,
  YI: 1,
  BING: 2,
  DING: 3,
  WU: 4,
  JI: 5,
  GENG: 6,
  XIN: 7,
  REN: 8,
  GUI: 9,
} as const;
export type Stem = (typeof Stem)[keyof typeof Stem];

/** 十二支（0=子 … 11=亥） */
export const Branch = {
  ZI: 0,
  CHOU: 1,
  YIN: 2,
  MAO: 3,
  CHEN: 4,
  SI: 5,
  WU: 6,
  WEI: 7,
  SHEN: 8,
  YOU: 9,
  XU: 10,
  HAI: 11,
} as const;
export type Branch = (typeof Branch)[keyof typeof Branch];
