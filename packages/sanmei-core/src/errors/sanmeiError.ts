/** コアが送出する機械可読コード（BFF が HTTP にマップ）。IMPLEMENTATION §5.0.1 と整合。 */
export const SanmeiErrorCode = {
  TIME_REQUIRED_FOR_SOLAR_TERM: "TIME_REQUIRED_FOR_SOLAR_TERM",
  RULESET_VERSION_UNSUPPORTED: "RULESET_VERSION_UNSUPPORTED",
  RULESET_DATA_MISSING: "RULESET_DATA_MISSING",
  CALCULATION_ANOMALY: "CALCULATION_ANOMALY",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_TIMEZONE: "INVALID_TIMEZONE",
} as const;

export type SanmeiErrorCode = (typeof SanmeiErrorCode)[keyof typeof SanmeiErrorCode];

export class SanmeiError extends Error {
  readonly code: SanmeiErrorCode;
  readonly details?: unknown;

  constructor(code: SanmeiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "SanmeiError";
    this.code = code;
    this.details = details;
  }
}
