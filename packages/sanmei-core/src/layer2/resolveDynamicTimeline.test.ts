import { describe, expect, it } from "vitest";
import {
  calendarAgeLocalYmd,
  determineDaiunDirection,
  normalizeMod60,
  roundDaiunStartAge,
} from "./resolveDynamicTimeline.js";

describe("calendarAgeLocalYmd", () => {
  it("誕生日前は満年齢が 1 つ少ない", () => {
    expect(calendarAgeLocalYmd("2000-06-15", "2026-01-01")).toBe(25);
  });

  it("誕生日当日以降は繰り上がる", () => {
    expect(calendarAgeLocalYmd("2000-06-15", "2026-06-15")).toBe(26);
  });
});

describe("determineDaiunDirection", () => {
  it("陽年干の男性は forward", () => {
    expect(determineDaiunDirection(0, "male")).toBe("forward");
  });

  it("陽年干の女性は backward", () => {
    expect(determineDaiunDirection(0, "female")).toBe("backward");
  });

  it("陰年干の男性は backward", () => {
    expect(determineDaiunDirection(1, "male")).toBe("backward");
  });

  it("陰年干の女性は forward", () => {
    expect(determineDaiunDirection(1, "female")).toBe("forward");
  });
});

describe("roundDaiunStartAge", () => {
  it("3除算の四捨五入を使う", () => {
    expect(roundDaiunStartAge(22)).toBe(7);
    expect(roundDaiunStartAge(23)).toBe(8);
  });

  it("0以下は1に補正する", () => {
    expect(roundDaiunStartAge(0)).toBe(1);
    expect(roundDaiunStartAge(1)).toBe(1);
  });

  it("11以上は10に補正する", () => {
    expect(roundDaiunStartAge(33)).toBe(10);
    expect(roundDaiunStartAge(40)).toBe(10);
  });
});

describe("normalizeMod60", () => {
  it("負方向の境界値を 59 へ巻き戻す", () => {
    expect(normalizeMod60(-1)).toBe(59);
  });

  it("60 以上の値を 0-59 に正規化する", () => {
    expect(normalizeMod60(60)).toBe(0);
    expect(normalizeMod60(121)).toBe(1);
  });
});
