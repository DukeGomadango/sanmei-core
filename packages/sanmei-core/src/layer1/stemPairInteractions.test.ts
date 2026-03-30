import { describe, expect, it } from "vitest";
import { Branch, Stem } from "./enums.js";
import { areBranchesChong, areKangoPair, areStemsTenkokuPair } from "./stemPairInteractions.js";

describe("stemPairInteractions", () => {
  it("areBranchesChong", () => {
    expect(areBranchesChong(Branch.ZI, Branch.WU)).toBe(true);
    expect(areBranchesChong(Branch.ZI, Branch.CHOU)).toBe(false);
  });

  it("areKangoPair（干合）", () => {
    expect(areKangoPair(Stem.JIA, Stem.JI)).toBe(true);
    expect(areKangoPair(Stem.JIA, Stem.JIA)).toBe(false);
  });

  it("areStemsTenkokuPair（同陰陽かつ五行相剋）", () => {
    expect(areStemsTenkokuPair(Stem.JIA, Stem.WU)).toBe(true);
    expect(areStemsTenkokuPair(Stem.JIA, Stem.JI)).toBe(false);
    expect(areStemsTenkokuPair(Stem.JIA, Stem.YI)).toBe(false);
  });
});
