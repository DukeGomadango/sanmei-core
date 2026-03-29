import type { Element } from "./enums.js";
import { Element as El } from "./enums.js";

/** 母 → 子（相生） */
export function shengChild(mother: Element): Element {
  const motherToChild = [El.FIRE, El.EARTH, El.METAL, El.WATER, El.WOOD];
  return motherToChild[mother];
}

/** 克つ側 → 克たれる側（相剋） */
export function keTarget(mukitsu: Element): Element {
  const k = [El.EARTH, El.METAL, El.WATER, El.WOOD, El.FIRE];
  return k[mukitsu];
}
