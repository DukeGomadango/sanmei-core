import type { Branch, Stem } from "../layer1/enums.js";
import { stemBranchToIndex } from "../layer1/sexagenary.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";

/** 単位円に内接する正三角形の面積（行動領域面積比の正規化分母）。学派差は将来 `ruleset.meta` 等へ。 */
export const UNIT_CIRCLE_INSCRIBED_EQUILATERAL_TRIANGLE_AREA = (3 * Math.sqrt(3)) / 4;

export function vertexAnglesDegTenthsForPillars(
  year: { stem: Stem; branch: Branch },
  month: { stem: Stem; branch: Branch },
  day: { stem: Stem; branch: Branch },
): [number, number, number] {
  const iy = stemBranchToIndex(year.stem, year.branch);
  const im = stemBranchToIndex(month.stem, month.branch);
  const id = stemBranchToIndex(day.stem, day.branch);
  if (iy < 0 || im < 0 || id < 0) {
    throw new SanmeiError(SanmeiErrorCode.CALCULATION_ANOMALY, "六十甲子インデックスが無効な柱がある", {
      year: [year.stem, year.branch],
      month: [month.stem, month.branch],
      day: [day.stem, day.branch],
    });
  }
  return [iy * 60, im * 60, id * 60];
}

/** 度×10 整数 3 点を単位円上の多角形として Shoelace で面積し、内接正三角形面積で除して千分率に整数化する。 */
export function areaRatioPermilleFromVertexTenths(vertexAnglesDegTenths: readonly [number, number, number]): number {
  const n = 3;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const deg = vertexAnglesDegTenths[i]! / 10;
    const r = (deg * Math.PI) / 180;
    xs.push(Math.cos(r));
    ys.push(Math.sin(r));
  }
  xs.push(xs[0]!);
  ys.push(ys[0]!);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += xs[i]! * ys[i + 1]! - ys[i]! * xs[i + 1]!;
  }
  const area = 0.5 * Math.abs(sum);
  const rawPermille = Math.round((area / UNIT_CIRCLE_INSCRIBED_EQUILATERAL_TRIANGLE_AREA) * 1000);
  return Math.min(1000, Math.max(0, rawPermille));
}
