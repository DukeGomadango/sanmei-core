import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CalculateResultSchema,
  createJodaCalendarPort,
  SanmeiErrorCode,
  SolarTermStore,
  type SolarTermsFile,
} from "@sanmei/sanmei-core";
import { createApp, parseJsonBodyOrNull } from "../app.js";
import { createCalculateDeps } from "../deps.js";
import { MALFORMED_JSON_CODE } from "../mapSanmeiErrorToHttp.js";
import { normalizeSuccessBody } from "./snapshotNormalize.js";

const testDir = dirname(fileURLToPath(import.meta.url));
const coreRoot = join(testDir, "..", "..", "..", "sanmei-core");
const goldenInputPath = join(coreRoot, "src", "__fixtures__", "golden_mock_v1", "calculate_input.json");
const solarPath = join(coreRoot, "data", "solar-terms", "solar_terms.json");

function testDeps() {
  return {
    ...createCalculateDeps(),
    nowUtcMs: 0,
  };
}

function makeApp() {
  return createApp(testDeps());
}

describe("parseJsonBodyOrNull", () => {
  it("空・空白は null", () => {
    expect(parseJsonBodyOrNull("")).toBeNull();
    expect(parseJsonBodyOrNull("   \n  ")).toBeNull();
  });

  it("不正 JSON は null", () => {
    expect(parseJsonBodyOrNull("{")).toBeNull();
  });

  it("正しい JSON はオブジェクト", () => {
    expect(parseJsonBodyOrNull('{"a":1}')).toEqual({ a: 1 });
  });
});

describe("POST /api/v1/calculate", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("200: golden 入力・スキーマ通過・スナップショット", async () => {
    const input = JSON.parse(readFileSync(goldenInputPath, "utf-8")) as unknown;
    const app = makeApp();
    const res = await app.request("http://test/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(CalculateResultSchema.safeParse(json).success).toBe(true);
    const norm = normalizeSuccessBody(json, {
      calculatedAt: "1970-01-01T00:00:00.000Z",
      engineVersion: "0.2.0",
    });
    await expect(JSON.stringify(norm, null, 2) + "\n").toMatchFileSnapshot(
      "__snapshots__/calculate-success.mock-v1.snap",
    );
  });

  it("422 RULESET_VERSION_UNSUPPORTED", async () => {
    const app = makeApp();
    const res = await app.request("http://test/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
        systemConfig: { sect: "takao", rulesetVersion: "unknown-version-xyz" },
      }),
    });
    expect(res.status).toBe(422);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe(SanmeiErrorCode.RULESET_VERSION_UNSUPPORTED);
  });

  it("422 TIME_REQUIRED_FOR_SOLAR_TERM・solarTermInstant が ISO・ms は返さない", async () => {
    const solarFile = JSON.parse(readFileSync(solarPath, "utf-8")) as SolarTermsFile;
    const store = new SolarTermStore(solarFile);
    const port = createJodaCalendarPort();
    const z = store.all.find((e) => e.termId === "lichun" && e.instantUtcMs > Date.UTC(2020, 0, 1));
    expect(z).toBeDefined();
    const local = port.utcMsToLocalDateString(z!.instantUtcMs, "Asia/Tokyo");
    const app = createApp({
      solarTermStore: store,
      port,
      nowUtcMs: 0,
    });
    const res = await app.request("http://test/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          birthDate: local,
          birthTime: null,
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "Asia/Tokyo" },
        systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
      }),
    });
    expect(res.status).toBe(422);
    const json = (await res.json()) as {
      error: { code: string; details?: Record<string, unknown> };
    };
    expect(json.error.code).toBe(SanmeiErrorCode.TIME_REQUIRED_FOR_SOLAR_TERM);
    expect(json.error.details).toBeDefined();
    expect(json.error.details?.solarTermInstantUtcMs).toBeUndefined();
    expect(typeof json.error.details?.solarTermInstant).toBe("string");
    expect(json.error.details?.solarTermInstant).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("400 VALIDATION_ERROR（timeZone 不一致）", async () => {
    const app = makeApp();
    const res = await app.request("http://test/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          birthDate: "2000-06-15",
          birthTime: "12:00",
          timeZoneId: "Asia/Tokyo",
          gender: "male",
        },
        context: { asOf: "2026-01-01", timeZone: "UTC" },
        systemConfig: { sect: "takao", rulesetVersion: "mock-v1" },
      }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe(SanmeiErrorCode.VALIDATION_ERROR);
  });

  it("400 MALFORMED_JSON", async () => {
    const app = makeApp();
    const res = await app.request("http://test/api/v1/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string; message: string } };
    expect(json.error.code).toBe(MALFORMED_JSON_CODE);
    expect(json.error.message).toBe("Invalid JSON payload");
  });
});
