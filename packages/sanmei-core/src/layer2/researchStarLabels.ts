import { researchMainStarLabelForIds, researchSubStarLabelForIds } from "./researchStarTables.js";

/**
 * mock-v1 行列と同一の `MA_a_b` / `SU_a_b` から研究用表示ラベルを生成。
 * 文言は算命学アカデミー（2018）公開表＋ WORKFLOW 18.10.1 相当の従星正規化（`researchStarTables`）。
 */
export function buildResearchStarLabelsCatalog(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      out[`MA_${a}_${b}`] = researchMainStarLabelForIds(a, b);
    }
  }
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 12; b++) {
      out[`SU_${a}_${b}`] = researchSubStarLabelForIds(a, b);
    }
  }
  return out;
}

/** バンドル `mainStars` / `subordinateStars` から starId の集合を抽出（カタログ網羅テスト用）。 */
export function collectMatrixStarIdsFromRuleset(ruleset: {
  mainStars: Record<string, Record<string, string>>;
  subordinateStars: Record<string, Record<string, string>>;
}): Set<string> {
  const s = new Set<string>();
  for (const row of Object.values(ruleset.mainStars)) {
    for (const id of Object.values(row)) s.add(id);
  }
  for (const row of Object.values(ruleset.subordinateStars)) {
    for (const id of Object.values(row)) s.add(id);
  }
  return s;
}

/** デバッグ・テスト用: starId から期待ラベル（カタログと同じ規則）。 */
export function researchStarLabelFromStarId(starId: string): string | undefined {
  const main = /^MA_(\d+)_(\d+)$/.exec(starId);
  if (main) {
    const a = Number(main[1]);
    const b = Number(main[2]);
    if (a >= 0 && a <= 9 && b >= 0 && b <= 9) return researchMainStarLabelForIds(a, b);
    return undefined;
  }
  const sub = /^SU_(\d+)_(\d+)$/.exec(starId);
  if (sub) {
    const a = Number(sub[1]);
    const br = Number(sub[2]);
    if (a >= 0 && a <= 9 && br >= 0 && br <= 11) return researchSubStarLabelForIds(a, br);
    return undefined;
  }
  return undefined;
}
