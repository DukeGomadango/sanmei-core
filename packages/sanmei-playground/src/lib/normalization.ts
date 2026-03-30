import type { CalculateInput } from "@sanmei/sanmei-core";
import type { ControlsState } from "./types";

function normalizeBirthTime(value: string | null): string | null {
  // HTML input time cleared => "" を受け取ることがあるため null 化
  if (value === "" || value == null) return null;
  return value;
}

export function buildPayload(controls: ControlsState): CalculateInput {
  const birthTime = normalizeBirthTime(controls.birthTime);

  // コア側は user.timeZoneId と context.timeZone の一致を要求する
  const tz = controls.timeZone;

  return {
    user: {
      birthDate: controls.birthDate,
      birthTime,
      gender: controls.gender,
      timeZoneId: tz,
    },
    context: {
      asOf: controls.asOf,
      timeZone: tz,
    },
    systemConfig: {
      sect: controls.sect,
      rulesetVersion: controls.rulesetVersion,
    },
    options: {
      // 管理者向け Playground は常に要求。公開可否は BFF が強制制御する。
      includeDebugTrace: true,
    },
  };
}

