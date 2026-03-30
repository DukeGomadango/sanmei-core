import type { YousenLayer2 } from "../schemas/layer2.js";

/** API 応答用: 主星5＋従星3 に出現する starId だけをカタログから抜き出す。 */
export function subsetStarLabelsForYousen(
  yousen: YousenLayer2,
  catalog: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!catalog || Object.keys(catalog).length === 0) return undefined;
  const ids = new Set<string>();
  for (const m of yousen.mainStars) ids.add(m.starId);
  for (const s of yousen.subordinateStars) ids.add(s.starId);
  const out: Record<string, string> = {};
  for (const id of ids) {
    const label = catalog[id];
    if (label !== undefined) out[id] = label;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
