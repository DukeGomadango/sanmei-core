/**
 * SanmeiError → HTTP の正本は Docs/REQUIREMENTS-v1.1.md §7。
 * 5xx はクライアント向け details をマスク（フルはサーバログ）。
 */
import { SanmeiErrorCode, type SanmeiError, type SanmeiErrorCode as Code } from "@sanmei/sanmei-core";

export const MALFORMED_JSON_CODE = "MALFORMED_JSON" as const;

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function malformedJsonBody(): ApiErrorBody {
  return {
    error: {
      code: MALFORMED_JSON_CODE,
      message: "Invalid JSON payload",
    },
  };
}

const statusByCode: Record<Code, number> = {
  [SanmeiErrorCode.VALIDATION_ERROR]: 400,
  [SanmeiErrorCode.INVALID_TIMEZONE]: 400,
  [SanmeiErrorCode.RULESET_VERSION_UNSUPPORTED]: 422,
  [SanmeiErrorCode.TIME_REQUIRED_FOR_SOLAR_TERM]: 422,
  [SanmeiErrorCode.RULESET_DATA_MISSING]: 500,
  [SanmeiErrorCode.CALCULATION_ANOMALY]: 500,
};

function transformTimeRequiredClientDetails(details: unknown): unknown {
  if (details === null || typeof details !== "object") return details;
  const d = details as Record<string, unknown>;
  const out: Record<string, unknown> = { ...d };
  const ms = d.solarTermInstantUtcMs;
  delete out.solarTermInstantUtcMs;
  if (typeof ms === "number" && Number.isFinite(ms)) {
    out.solarTermInstant = new Date(ms).toISOString();
  }
  return out;
}

function clientDetailsFor(code: Code, details: unknown): unknown | undefined {
  const status = statusByCode[code];
  if (status >= 500) return undefined;
  if (code === SanmeiErrorCode.TIME_REQUIRED_FOR_SOLAR_TERM) {
    return transformTimeRequiredClientDetails(details);
  }
  return details;
}

/** ログ用（5xx でもフル details を残す） */
export function logPayloadFromSanmeiError(err: SanmeiError): unknown {
  return { code: err.code, message: err.message, details: err.details };
}

export function sanmeiErrorToHttp(err: SanmeiError): { status: number; body: ApiErrorBody } {
  const status = statusByCode[err.code] ?? 500;
  const details = clientDetailsFor(err.code, err.details);
  const body: ApiErrorBody = {
    error: {
      code: err.code,
      message: err.message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return { status, body };
}

export function internalErrorBody(message = "Internal Server Error"): ApiErrorBody {
  return {
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
  };
}
