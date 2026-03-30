import { Element as El, type Element } from "../layer1/enums.js";
import { SanmeiError, SanmeiErrorCode } from "../errors/sanmeiError.js";

const MAP: Record<string, Element> = {
  WOOD: El.WOOD,
  FIRE: El.FIRE,
  EARTH: El.EARTH,
  METAL: El.METAL,
  WATER: El.WATER,
};

export function elementsFromRulesetStrings(codes: readonly string[]): Element[] {
  return codes.map((s) => {
    const e = MAP[s];
    if (e === undefined) {
      throw new SanmeiError(
        SanmeiErrorCode.RULESET_DATA_MISSING,
        `ruleset に未定義の五行コード: ${JSON.stringify(s)}`,
      );
    }
    return e;
  });
}
