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
  const researchBase = {
    context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
    systemConfig: { sect: "research", rulesetVersion: "research-v1" },
  } as const;

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

  it("research-experimental-v1 は baseProfile を research-v1 と同一に保ち meta.warnings を返す", () => {
    const input = JSON.parse(readFileSync(join(researchGoldenDir, "calculate_input.json"), "utf-8"));
    const baseline = calculate(input, { solarTermStore: store, port, nowUtcMs: 0 });
    const got = calculate(
      {
        ...input,
        systemConfig: { ...input.systemConfig, rulesetVersion: "research-experimental-v1" },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    expect(CalculateResultSchema.safeParse(got).success).toBe(true);
    expect(got.baseProfile).toEqual(baseline.baseProfile);
    expect(got.meta.warnings?.some((w) => w.includes("research-experimental-v1"))).toBe(true);
    expect(got.interactionRules.resolutionMeta?.ruleSetId).toBe("research-experimental-v1");
    expect(
      getBundledRuleset("research-experimental-v1").interaction?.kaku?.candidateRules.some(
        (r) => r.id === "KAKU_TENKOKUCHICHU",
      ),
    ).toBe(true);
  });

  it("research-v1 の大運は direction と startDayDiff を返す", () => {
    const input = JSON.parse(readFileSync(join(researchGoldenDir, "calculate_input.json"), "utf-8"));
    const got = calculate(input, { solarTermStore: store, port, nowUtcMs: 0 });
    expect(got.dynamicTimeline.daiun.direction).toMatch(/forward|backward/);
    expect(got.dynamicTimeline.daiun.startDayDiff).toBeTypeOf("number");
    expect((got.dynamicTimeline.daiun.startDayDiff ?? -1) >= 0).toBe(true);
  });

  it("research-v1 は大運フェーズごとに targetPillar 付き interactions を返す", () => {
    const input = JSON.parse(readFileSync(join(researchGoldenDir, "calculate_input.json"), "utf-8"));
    const got = calculate(input, { solarTermStore: store, port, nowUtcMs: 0 });
    const phases = got.dynamicTimeline.daiun.phases;
    expect(phases.length).toBeGreaterThan(0);
    phases.forEach((phase) => {
      expect(Array.isArray(phase.interactions)).toBe(true);
      for (const item of phase.interactions ?? []) {
        expect(item.phaseIndex).toBe(phase.phaseIndex);
        expect(item.fortuneType).toBe("DAIUN");
        expect(item.targetPillar).toMatch(/YEAR|MONTH|DAY/);
      }
    });
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

  it("allowGohouInKaku で kaku.resolved が分岐する", () => {
    const baseInput = JSON.parse(readFileSync(join(researchGoldenDir, "calculate_input.json"), "utf-8"));
    const rFalse = calculate(baseInput, { solarTermStore: store, port, nowUtcMs: 0 });
    const rTrue = calculate(
      {
        ...baseInput,
        systemConfig: {
          ...baseInput.systemConfig,
          allowGohouInKaku: true,
        },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    expect(rFalse.interactionRules.kaku?.meta.allowGohouInKakuApplied).toBe(false);
    expect(rTrue.interactionRules.kaku?.meta.allowGohouInKakuApplied).toBe(true);
    expect(rFalse.interactionRules.kaku?.meta.evaluateShadowProfileApplied).toBe(false);
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

  it("research-v1 の debugTrace に大運根拠値が載る", () => {
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
        options: { includeDebugTrace: true },
      },
      { solarTermStore: store, port, nowUtcMs: 0 },
    );
    const nodes = r.interactionRules.debugTrace?.nodes ?? [];
    const timelineNode = nodes.find((n) => n.stepId === "resolveDynamicTimeline");
    expect(timelineNode).toBeDefined();
    expect(timelineNode?.result.startDayDiff).toBeTypeOf("number");
    expect(timelineNode?.result.roundedStartAge).toBeTypeOf("number");
  });

  describe("research secondary daiun cases", () => {
    it("DAIUN-S-001-normal-forward: 陽年干男性で順回り", () => {
      const r = calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          ...researchBase,
        },
        { solarTermStore: store, port, nowUtcMs: 0 },
      );
      expect(r.dynamicTimeline.daiun.direction).toBe("forward");
      expect((r.dynamicTimeline.daiun.startDayDiff ?? -1) >= 0).toBe(true);
    });

    it("DAIUN-S-002-normal-backward: 陽年干女性で逆回り", () => {
      const r = calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "female",
          },
          ...researchBase,
        },
        { solarTermStore: store, port, nowUtcMs: 0 },
      );
      expect(r.dynamicTimeline.daiun.direction).toBe("backward");
      const phases = r.dynamicTimeline.daiun.phases;
      expect(phases.length).toBeGreaterThan(1);
      const p0 = phases[0]!.sexagenaryIndex;
      const p1 = phases[1]!.sexagenaryIndex;
      expect((p0 + 59) % 60).toBe(p1);
    });

    it("DAIUN-S-003-rounding-half-up: 端数処理は整数startAgeに反映", () => {
      const r = calculate(
        {
          user: {
            birthDate: "2000-06-15",
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          ...researchBase,
          options: { includeDebugTrace: true },
        },
        { solarTermStore: store, port, nowUtcMs: 0 },
      );
      const node = r.interactionRules.debugTrace?.nodes.find((n) => n.stepId === "resolveDynamicTimeline");
      expect(node?.result.roundedStartAge).toBe(r.dynamicTimeline.daiun.startAge);
    });

    it("DAIUN-S-004-boundary-same-day: 境界日付でも起算日数は非負", () => {
      const term = store.all.find((e) => e.termId === "lichun" && e.instantUtcMs > Date.UTC(2020, 0, 1));
      expect(term).toBeDefined();
      const boundaryBirthDate = port.utcMsToLocalDateString(term!.instantUtcMs, "Asia/Tokyo");
      const r = calculate(
        {
          user: {
            birthDate: boundaryBirthDate,
            birthTime: "12:00",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          ...researchBase,
        },
        { solarTermStore: store, port, nowUtcMs: 0 },
      );
      expect((r.dynamicTimeline.daiun.startDayDiff ?? -1) >= 0).toBe(true);
    });

    it("DAIUN-S-005-clamp-zero-eleven: startAgeは1..10にクランプされる", () => {
      const r = calculate(
        {
          user: {
            birthDate: "2000-01-01",
            birthTime: "00:10",
            timeZoneId: "Asia/Tokyo",
            gender: "male",
          },
          ...researchBase,
        },
        { solarTermStore: store, port, nowUtcMs: 0 },
      );
      expect(r.dynamicTimeline.daiun.startAge).toBeGreaterThanOrEqual(1);
      expect(r.dynamicTimeline.daiun.startAge).toBeLessThanOrEqual(10);
    });
  });

  describe("research primary daiun slots (supervisor-confirmed pending)", () => {
    it.todo("DAIUN-P-001-start-rule-l0: 起算規則のL0確定値で検証");
    it.todo("DAIUN-P-002-direction-rule-l0: 順逆規則のL0確定値で検証");
    it.todo("DAIUN-P-003-rounding-rule-l0: 丸め規則のL0確定値で検証");
    it.todo("DAIUN-P-004-boundary-rule-l0: 境界例外のL0確定値で検証");
    it.todo("DAIUN-P-005-end-to-end-l0: 監修ゴールデン入力で総合検証");
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
