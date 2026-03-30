import type { CalculateRequestError } from "../lib/api/calculateApi";

export function ErrorBanner({ error }: { error: CalculateRequestError | null | undefined }) {
  if (!error) return null;

  let supportedText: string | null = null;
  if (error.code === "RULESET_VERSION_UNSUPPORTED" && error.details && typeof error.details === "object") {
    const d = error.details as { supported?: unknown };
    const supported = Array.isArray(d.supported) ? (d.supported.filter((x) => typeof x === "string") as string[]) : [];
    if (supported.length > 0) {
      supportedText = supported.join(", ");
    }
  }

  return (
    <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <div className="font-semibold">{error.code}</div>
      <div className="whitespace-pre-wrap">{error.message}</div>
      {supportedText && <div className="mt-2 text-xs">supported: {supportedText}</div>}
    </div>
  );
}

