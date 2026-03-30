import type { ControlsState } from "../types";

export const DEFAULT_TIME_ZONE = "Asia/Tokyo";

const STEM_LABELS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCH_LABELS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const ELEMENT_LABELS = ["木", "火", "土", "金", "水"] as const;

// 0=WOOD ... 4=WATER
const STEM_TO_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4] as const;

export function elementColorClasses(element: number): { text: string; bg: string; border: string } {
  // 五行→視覚差分（UI専用の固定テーブル）
  const map = [
    { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" }, // 木
    { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" }, // 火
    { text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" }, // 土
    { text: "text-sky-800", bg: "bg-sky-50", border: "border-sky-200" }, // 金
    { text: "text-blue-800", bg: "bg-blue-50", border: "border-blue-200" }, // 水
  ] as const;
  return map[element] ?? map[0]!;
}

export function stemColorClasses(stem: number) {
  const element = STEM_TO_ELEMENT[stem] ?? 0;
  return elementColorClasses(element);
}

export function stemLabel(stem: number): string {
  return STEM_LABELS[stem] ?? "?";
}

export function branchLabel(branch: number): string {
  return BRANCH_LABELS[branch] ?? "?";
}

export function todayYmdInTimeZone(timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  // en-CA は YYYY-MM-DD 形式で返るため、そのまま使える
  return dtf.format(new Date());
}

export const Dict = {
  initialControls(): ControlsState {
    return {
      birthDate: "2000-01-01",
      birthTime: null,
      gender: "male",
      asOf: todayYmdInTimeZone(DEFAULT_TIME_ZONE),
      timeZone: DEFAULT_TIME_ZONE,
      sect: "takao",
      rulesetVersion: "mock-v1",
      allowGohouInKaku: false,
    };
  },

  // starId は stable ID だが、UI 表示は固定辞書（または固定生成ルール）でラベルに変換する
  // mock-v1 の starId 形式（MA_a_b / SU_a_b）に基づく合成ラベル
  starLabel(starId: string): string {
    const m = /^MA_(\d+)_(\d+)$/.exec(starId);
    if (m) {
      const ord = Number(m[2]) + 1;
      return `十大主星（候補${ord}）`;
    }
    const s = /^SU_(\d+)_(\d+)$/.exec(starId);
    if (s) {
      const ord = Number(s[2]) + 1;
      return `十二大従星（候補${ord}）`;
    }
    return "星（未知）";
  },
} as const;

export function elementLabel(element: number): string {
  return ELEMENT_LABELS[element] ?? "?";
}

