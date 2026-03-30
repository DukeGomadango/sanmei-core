import type { CalculateResult, TraceNode } from "@sanmei/sanmei-core";
import { branchLabel, stemLabel } from "./dictionaries";

export type TraceRow = {
  phaseLabel: string;
  stepLabel: string;
  ruleId: string;
  reason: string;
  inputItems: string[];
  resultItems: string[];
};

function formatValue(key: string, value: unknown): string {
  if (typeof value === "number") {
    if (key.toLowerCase().includes("stem")) return stemLabel(value);
    if (key.toLowerCase().includes("branch")) return branchLabel(value);
  }
  if (Array.isArray(value)) return `[${value.join(", ")}]`;
  return String(value);
}

function formatItems(rec: Record<string, unknown>): string[] {
  return Object.entries(rec).map(([k, v]) => `${k}: ${formatValue(k, v)}`);
}

function stepLabel(stepId: string): string {
  const m: Record<string, string> = {
    resolveInsenWithDepth: "陰占三柱と深さの解決",
    "resolveZokan.year": "年柱の蔵干採用",
    "resolveZokan.month": "月柱の蔵干採用",
    "resolveZokan.day": "日柱の蔵干採用",
    resolveMainStars: "十大主星の決定",
    resolveSubordinateStars: "十二大従星の決定",
    resolveGuardianKishin: "守護神・忌神の決定",
    resolveEnergyData: "energyData の算出",
    resolveDestinyBugs: "destinyBugs の算出",
    resolveDynamicTimeline: "動的タイムラインの算出",
  };
  return m[stepId] ?? stepId;
}

function phaseLabel(phase: TraceNode["phase"]): string {
  const m: Record<TraceNode["phase"], string> = {
    LAYER1: "Layer1",
    LAYER2: "Layer2",
    LAYER3: "Layer3",
    SYSTEM: "System",
  };
  return m[phase];
}

function reasonLabel(reasonCode: string | null | undefined): string {
  if (!reasonCode) return "理由未設定";
  const m: Record<string, string> = {
    SOLAR_TERM_LOCAL_DAY_DIFF: "節入り基準で深さを確定",
    ZOKAN_DEPTH_TABLE_MATCH: "深さに一致する蔵干テーブルを採用",
    MATRIX_LOOKUP: "行列ルールに基づき選択",
    RULESET_MATCH: "ruleset 条件に一致",
    ENERGY_RULE_APPLIED: "energy 規則を適用",
    DESTINY_RULE_MATCH: "宿命ルールに一致",
    TIMELINE_RULE_APPLIED: "大運・年運ルールを適用",
  };
  return m[reasonCode] ?? reasonCode;
}

function toRow(node: TraceNode): TraceRow {
  return {
    phaseLabel: phaseLabel(node.phase),
    stepLabel: stepLabel(node.stepId),
    ruleId: node.ruleId ?? "-",
    reason: reasonLabel(node.reasonCode),
    inputItems: formatItems(node.inputs),
    resultItems: formatItems(node.result),
  };
}

export function buildLayerRows(data: CalculateResult | null | undefined): {
  layer1: TraceRow[];
  layer2: TraceRow[];
  layer3: TraceRow[];
} {
  const nodes = data?.interactionRules.debugTrace?.nodes ?? [];
  const layer1 = nodes.filter((n) => n.phase === "LAYER1").map(toRow);
  const layer2 = nodes.filter((n) => n.phase === "LAYER2").map(toRow);
  const layer3 = nodes.filter((n) => n.phase === "LAYER3").map(toRow);
  return { layer1, layer2, layer3 };
}
