import { describe, expect, it } from "vitest";
import { Element, Stem, Branch } from "./enums.js";
import { STEM_ELEMENT, STEM_YINYANG } from "./stemBranchTables.js";
import { keTarget, shengChild } from "./wuxingRelations.js";
import { kangoPartner, areKangoPair } from "./kango.js";
import { indexToStemBranch, stemBranchToIndex, nextIndex } from "./sexagenary.js";

describe("stem tables", () => {
  it("甲は木・陽", () => {
    expect(STEM_ELEMENT[Stem.JIA]).toBe(Element.WOOD);
    expect(STEM_YINYANG[Stem.JIA]).toBe(1);
  });
});

describe("wuxing", () => {
  it("木生火", () => {
    expect(shengChild(Element.WOOD)).toBe(Element.FIRE);
  });
  it("木克土", () => {
    expect(keTarget(Element.WOOD)).toBe(Element.EARTH);
  });
});

describe("kango", () => {
  it("甲己合", () => {
    expect(kangoPartner(Stem.JIA)).toBe(Stem.JI);
    expect(areKangoPair(Stem.JIA, Stem.JI)).toBe(true);
  });
});

describe("sexagenary", () => {
  it("60 周期", () => {
    expect(nextIndex(59)).toBe(0);
    const { stem, branch } = indexToStemBranch(0);
    expect(stem).toBe(Stem.JIA);
    expect(branch).toBe(Branch.ZI);
    expect(stemBranchToIndex(Stem.JIA, Branch.ZI)).toBe(0);
  });
});
