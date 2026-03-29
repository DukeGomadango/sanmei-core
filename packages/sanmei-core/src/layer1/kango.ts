import type { Stem } from "./enums.js";
import { Stem as S } from "./enums.js";

/** 干合ペア（DOMAIN-GLOSSARY §1.5）。片方から相手を返す。無ければ undefined。 */
export function kangoPartner(stem: Stem): Stem | undefined {
  const pairs: Record<number, Stem> = {
    [S.JIA]: S.JI,
    [S.YI]: S.GENG,
    [S.BING]: S.XIN,
    [S.DING]: S.REN,
    [S.WU]: S.GUI,
    [S.JI]: S.JIA,
    [S.GENG]: S.YI,
    [S.XIN]: S.BING,
    [S.REN]: S.DING,
    [S.GUI]: S.WU,
  };
  return pairs[stem];
}

export function areKangoPair(a: Stem, b: Stem): boolean {
  return kangoPartner(a) === b;
}
