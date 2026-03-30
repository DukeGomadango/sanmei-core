import { describe, expect, it } from "vitest";
import { calendarAgeLocalYmd } from "./resolveDynamicTimeline.js";

describe("calendarAgeLocalYmd", () => {
  it("誕生日前は満年齢が 1 つ少ない", () => {
    expect(calendarAgeLocalYmd("2000-06-15", "2026-01-01")).toBe(25);
  });

  it("誕生日当日以降は繰り上がる", () => {
    expect(calendarAgeLocalYmd("2000-06-15", "2026-06-15")).toBe(26);
  });
});
