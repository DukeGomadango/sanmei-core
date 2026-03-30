import { solarTermLabel } from "./solarTermLabels";

type TimeRequiredDetails = {
  solarTerm?: string | null;
  solarTermInstant?: string | null;
  reason?: string | null;
};

export function parseTimeRequiredDetails(details: unknown): TimeRequiredDetails | null {
  if (details === null || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  return {
    solarTerm: typeof d.solarTerm === "string" ? d.solarTerm : d.solarTerm == null ? null : String(d.solarTerm),
    solarTermInstant: typeof d.solarTermInstant === "string" ? d.solarTermInstant : null,
    reason: typeof d.reason === "string" ? d.reason : null,
  };
}

/** BFF の `solarTermInstant` は UTC ISO。`timeZone` でローカル表示する。 */
export function formatSolarInstantLocal(isoUtc: string, timeZone: string): string {
  try {
    const dt = new Date(isoUtc);
    if (Number.isNaN(dt.getTime())) return isoUtc;
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(dt);
  } catch {
    return isoUtc;
  }
}

/**
 * 節入り日一致422向けの実務メッセージ（API message を補足する）。
 */
export function buildTimeRequiredUserMessage(
  apiMessage: string,
  details: unknown,
  timeZone: string,
): string {
  const parsed = parseTimeRequiredDetails(details);
  const termJa = solarTermLabel(parsed?.solarTerm);
  const parts: string[] = [apiMessage];

  if (parsed?.solarTermInstant) {
    const local = formatSolarInstantLocal(parsed.solarTermInstant, timeZone);
    parts.push(
      `${termJa}の節入りは ${local}（${timeZone}）です。生年月日がその暦日と一致するため、民用時刻の出生時刻を入力してください。`,
    );
  } else {
    parts.push(
      `${termJa}が対象です。暦日と節入り日が一致する場合は出生時刻が必要です（civilian time・${timeZone}）。`,
    );
  }

  if (parsed?.reason && parsed.reason !== "BIRTH_DATE_EQUALS_SOLAR_TERM_LOCAL_DAY") {
    parts.push(`（理由コード: ${parsed.reason}）`);
  }

  return parts.join("\n");
}
