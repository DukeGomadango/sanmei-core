import type { CalculateInput, CalculateResult } from "@sanmei/sanmei-core";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class CalculateRequestError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(args: { status: number; code: string; message: string; details?: unknown }) {
    super(args.message);
    this.status = args.status;
    this.code = args.code;
    this.details = args.details;
  }
}

export function calculateApi(payload: CalculateInput): Promise<CalculateResult> {
  const debugTraceKey = import.meta.env.VITE_SANMEI_DEBUG_TRACE_KEY as string | undefined;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (debugTraceKey && debugTraceKey.length > 0) {
    headers["x-sanmei-debug-trace-key"] = debugTraceKey;
  }
  return fetch("/api/v1/calculate", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const text = await res.text();
    if (!res.ok) {
      let parsed: ApiErrorBody | null = null;
      try {
        parsed = JSON.parse(text) as ApiErrorBody;
      } catch {
        // BFF が JSON で返せない状況は fallback
      }
      const code = parsed?.error.code ?? "HTTP_ERROR";
      const message = parsed?.error.message ?? `HTTP ${res.status}`;
      const details = parsed?.error.details;
      throw new CalculateRequestError({ status: res.status, code, message, details });
    }

    // OK のときは JSON を返す
    return JSON.parse(text) as CalculateResult;
  });
}

export type { CalculateRequestError as CalculateRequestErrorType };

