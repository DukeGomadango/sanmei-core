import type { Branch, Stem } from "../layer1/enums.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";

/** 十干 甲…癸（Stem 0..9 と同順） */
export const STEM_CHARS = "甲乙丙丁戊己庚辛壬癸" as const;

/** 十二支 子…亥（Branch 0..11 と同順） */
export const BRANCH_CHARS = "子丑寅卯辰巳午未申酉戌亥" as const;

export function getStemCharFromId(id: Stem): string {
  const c = STEM_CHARS[id];
  if (c === undefined) throw new SanmeiError(SanmeiErrorCode.CALCULATION_ANOMALY, `invalid Stem: ${id}`);
  return c;
}

export function getBranchCharFromId(id: Branch): string {
  const c = BRANCH_CHARS[id];
  if (c === undefined) throw new SanmeiError(SanmeiErrorCode.CALCULATION_ANOMALY, `invalid Branch: ${id}`);
  return c;
}

/** 単一 Unicode 干文字 → Stem */
export function getStemIdFromChar(char: string): Stem {
  if ([...char].length !== 1) {
    throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, `干は1文字である必要があります: ${JSON.stringify(char)}`);
  }
  const i = STEM_CHARS.indexOf(char as "甲");
  if (i < 0) {
    throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, `未知の干: ${JSON.stringify(char)}`);
  }
  return i as Stem;
}

/** 単一 Unicode 支文字 → Branch */
export function getBranchIdFromChar(char: string): Branch {
  if ([...char].length !== 1) {
    throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, `支は1文字である必要があります: ${JSON.stringify(char)}`);
  }
  const i = BRANCH_CHARS.indexOf(char as "子");
  if (i < 0) {
    throw new SanmeiError(SanmeiErrorCode.VALIDATION_ERROR, `未知の支: ${JSON.stringify(char)}`);
  }
  return i as Branch;
}
