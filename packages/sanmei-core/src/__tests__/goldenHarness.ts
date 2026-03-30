import type { CalculateResult } from "../schemas/layer2.js";

/** ゴールデン比較で `calculatedAt`・`engineVersion` のノイズを除く（package バンプや時刻固定の揺れ防止） */
export function normalizeResultMeta(
  r: CalculateResult,
  opts?: { engineVersion?: string; calculatedAt?: string },
): CalculateResult {
  return {
    ...r,
    meta: {
      ...r.meta,
      engineVersion: opts?.engineVersion ?? r.meta.engineVersion,
      calculatedAt: opts?.calculatedAt ?? r.meta.calculatedAt,
    },
  };
}
