/** コアの goldenHarness と同趣旨（BFF テスト専用・コア __tests__ に依存しない） */
export function normalizeSuccessBody(
  obj: unknown,
  opts?: { engineVersion?: string; calculatedAt?: string },
): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  const r = obj as Record<string, unknown>;
  const meta = r.meta;
  if (!meta || typeof meta !== "object") return obj;
  const m = meta as Record<string, unknown>;
  return {
    ...r,
    meta: {
      ...m,
      engineVersion: opts?.engineVersion ?? m.engineVersion,
      calculatedAt: opts?.calculatedAt ?? m.calculatedAt,
    },
  };
}
