/** Playground のルール版プルダウン用（API 値は value のみ） */
export const RULESET_SELECT_OPTIONS = [
  { value: "mock-v1", label: "mock-v1", group: "モック" },
  { value: "mock-internal-v2", label: "mock-internal-v2", group: "モック" },
  { value: "research-v1", label: "research-v1（位相法・格法）", group: "研究" },
  {
    value: "research-experimental-v1",
    label: "research-experimental-v1（拡張・実験）",
    group: "研究",
  },
] as const;
