import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { calculate } from "./calculate.js";
import { SanmeiError, SanmeiErrorCode } from "./errors/sanmeiError.js";
import { SolarTermStore } from "./layer1/solarTerms/store.js";
import type { SolarTermsFile } from "./layer1/solarTerms/types.js";
import { createJodaCalendarPort } from "./layer1/calendar/jodaAdapter.js";
import { CalculateResultSchema } from "./schemas/layer2.js";
import { normalizeResultMeta } from "./__tests__/goldenHarness.js";
import { getBundledRuleset } from "./layer2/bundledRulesets.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const solarPath = join(pkgRoot, "data", "solar-terms", "solar_terms.json");
const solarFile = JSON.parse(readFileSync(solarPath, "utf-8")) as SolarTermsFile;
const store = new SolarTermStore(solarFile);
const port = createJodaCalendarPort();

const goldenDir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "golden_mock_v1");
const researchGoldenDir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "golden_research_v1");

describe("calculate", () => {
  it("RULESET_VERSION_UNSUPPORTED", () => {
    expect(() =>
      calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
          systemConfig: { sect: "takao", rulesetVersion: "unknown" },
        },
        { solarTermStore: store, port },
      ),
    ).toThrow(SanmeiError);
    try {
      calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
          systemConfig: { sect: "takao", rulesetVersion: "unknown" },
        },
        { solarTermStore: store, port },
      );
    } catch (e) {
      expect(e).toBeInstanceOf(SanmeiError);
      expect((e as SanmeiError).code).toBe(SanmeiErrorCode.RULESET_VERSION_UNSUPPORTED);
    }
  });

  it("TIME_REQUIRED_FOR_SOLAR_TERM", () => {
    const z = store.all.find((e) => e.termId === "lichun" && e.instantUtcMs > Date.UTC(2020, 0, 1));
    expect(z).toBeDefined();
    const local = port.utcMsToLocalDateString(z!.instantUtcMs, "Asia/Tokyo");
    expect(() =>
      calculate(
        {
          user: {
            birthDate: local,
            birthTime: null,
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
          systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        },
        { solarTermStore: store, port },
      ),
    ).toThrow(SanmeiError);
    try {
      calculate(
        {
          user: {
            birthDate: local,
            birthTime: null,
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
          systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        },
        { solarTermStore: store, port },
      );
    } catch (e) {
      expect(e).toBeInstanceOf(SanmeiError);
      expect((e as SanmeiError).code).toBe(SanmeiErrorCode.TIME_REQUIRED_FOR_SOLAR_TERM);
    }
  });

  it("user.timeZoneId と context.timeZone の不一致は VALIDATION_ERROR", () => {
    expect(() =>
      calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "UTC" },
          systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        },
        { solarTermStore: store, port },
      ),
    ).toThrow(SanmeiError);
  });

  it("golden_mock_v1 と一致（内部整合）", () => {
    const input = JSON.parse(readFileSync(join(goldenDir, "calculate_input.json"), "utf-8"));
    const expected = JSON.parse(readFileSync(join(goldenDir, "expected_output.json"), "utf-8"));
    const got = calculate(input, { solarTermStore: store, port, nowUtcMs: 0 });
    expect(CalculateResultSchema.safeParse(got).success).toBe(true);
    expect(normalizeResultMeta(got, { calculatedAt: "1970-01-01T00:00:00.000Z" })).toEqual(expected);
  });

  it("mock-internal-v2 は同一ルール本文なら baseProfile・dynamicTimeline が mock-v1 と一致", () => {
    const baseInput = JSON.parse(readFileSync(join(goldenDir, "calculate_input.json"), "utf-8"));
    const a = calculate(baseInput, { solarTermStore: store, port, nowUtcMs: 0 });
    const b = calculate(
      {
        ...baseInput,
        systemConfig: { ...baseInput.systemConfig, rulesetVersion: "mock-internal-v2" },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    expect(b.meta.rulesetVersion).toBe("mock-internal-v2");
    expect(b.baseProfile).toEqual(a.baseProfile);
    expect(b.dynamicTimeline).toEqual(a.dynamicTimeline);
  });

  it("research-v1 を受理し、最小ゴールデンと一致する", () => {
    const input = JSON.parse(readFileSync(join(researchGoldenDir, "calculate_input.json"), "utf-8"));
    const expected = JSON.parse(readFileSync(join(researchGoldenDir, "expected_output.json"), "utf-8"));
    const got = calculate(input, { solarTermStore: store, port, nowUtcMs: 0 });
    expect(CalculateResultSchema.safeParse(got).success).toBe(true);
    expect(normalizeResultMeta(got, { calculatedAt: "1970-01-01T00:00:00.000Z" })).toEqual(expected);
  });

  it("UTC タイムゾーンで計算できる", () => {
    const r = calculate(
      {
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "UTC",
          gender: "female",
        },
        context: { asOf: "2026-01-01", timeZone: "UTC" },
        systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    expect(CalculateResultSchema.safeParse(r).success).toBe(true);
    expect(r.interactionRules.isouhou).toEqual([]);
    expect(r.interactionRules.kyoki).toBeNull();
  });

  it("kyoki は null または shadowYousen 別フィールド契約を満たす", () => {
    const r = calculate(
      {
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
        systemConfig: { sect: "research", rulesetVersion: "research-v1" },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    const kyoki = r.interactionRules.kyoki;
    if (kyoki !== null) {
      expect(kyoki).toHaveProperty("shadowYousen");
      expect(kyoki).not.toHaveProperty("yousen");
    }
  });

  it("includeDebugTrace=true のとき typed debugTrace を返す", () => {
    const r = calculate(
      {
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
        systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        options: { includeDebugTrace: true },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    expect(r.interactionRules.debugTrace).toBeDefined();
    expect(r.interactionRules.debugTrace?.traceVersion).toBe(1);
    expect((r.interactionRules.debugTrace?.nodes ?? []).length).toBeGreaterThan(0);
  });

  it("debugTrace は birthDate/birthTime の生値を保持しない", () => {
    const r = calculate(
      {
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
        systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        options: { includeDebugTrace: true },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    const serialized = JSON.stringify(r.interactionRules.debugTrace ?? {});
    expect(serialized).not.toContain("2000-06-15");
    expect(serialized).not.toContain("12:00");
  });

  it("deps.ruleset がリクエストの rulesetVersion と不一致なら VALIDATION_ERROR", () => {
    try {
      calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
          systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
        },
        { solarTermStore: store, port, ruleset: getBundledRuleset("mock-internal-v2") },
      );
      expect.fail("throw すべき");
    } catch (e) {
      expect(e).toBeInstanceOf(SanmeiError);
      expect((e as SanmeiError).code).toBe(SanmeiErrorCode.VALIDATION_ERROR);
    }
  });
});
