import type { CalendarPort } from "./types.js";
import type { SolarTermStore } from "../solarTerms/store.js";

export type SolarTermCompare = "before" | "atOrAfter";

export function compareToSolarTermBoundary(birthUtcMs: number, termUtcMs: number): SolarTermCompare {
  return birthUtcMs < termUtcMs ? "before" : "atOrAfter";
}

/**
 * 節入りローカル日（TZ 投影）と birthDate が一致し、かつ時刻未指定なら true。
 */
export function requiresBirthTimeForSolarTerm(
  birthDate: string,
  birthTime: string | null | undefined,
  timeZoneId: string,
  termUtcMs: number,
  port: CalendarPort,
): boolean {
  if (birthTime != null && birthTime !== "") return false;
  const local = port.utcMsToLocalDateString(termUtcMs, timeZoneId);
  return birthDate === local;
}

/** birthDate がいずれかの節入りのローカル暦日と一致し、かつ時刻欠落 — マスタ件数小のため全走査 */
export function requiresBirthTimeForAnySolarTermOnDate(
  store: SolarTermStore,
  birthDate: string,
  birthTime: string | null | undefined,
  timeZoneId: string,
  port: CalendarPort,
): boolean {
  if (birthTime != null && birthTime !== "") return false;
  for (const e of store.all) {
    if (port.utcMsToLocalDateString(e.instantUtcMs, timeZoneId) === birthDate) return true;
  }
  return false;
}
