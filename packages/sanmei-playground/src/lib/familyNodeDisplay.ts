import type { FamilyLocation, FamilyNode } from "@sanmei/sanmei-core";

const PILLAR_LABEL: Record<FamilyLocation["pillar"], string> = {
  YEAR: "年柱",
  MONTH: "月柱",
  DAY: "日柱",
};

const SLOT_LABEL: Record<FamilyLocation["slot"], string> = {
  STEM: "天干",
  ZOUKAN_SHOGEN: "蔵干・初元",
  ZOUKAN_CHUGEN: "蔵干・中元",
  ZOUKAN_HONGEN: "蔵干・本元",
};

export function formatFamilyLocationPillar(loc: FamilyLocation): string {
  return PILLAR_LABEL[loc.pillar] ?? loc.pillar;
}

export function formatFamilyLocationSlot(loc: FamilyLocation): string {
  return SLOT_LABEL[loc.slot] ?? loc.slot;
}

/** 例: 「月柱・本元」「月柱・天干」 */
export function formatFamilyLocationBadge(loc: FamilyLocation): string {
  const pill = formatFamilyLocationPillar(loc);
  if (loc.slot === "STEM") return `${pill}・天干`;
  if (loc.slot === "ZOUKAN_SHOGEN") return `${pill}・初元`;
  if (loc.slot === "ZOUKAN_CHUGEN") return `${pill}・中元`;
  if (loc.slot === "ZOUKAN_HONGEN") return `${pill}・本元`;
  return `${pill}・${loc.slot}`;
}

export function formatFamilyNodeRow(node: FamilyNode): {
  role: string;
  pillarCol: string;
  slotCol: string;
  badge: string;
} {
  return {
    role: node.role,
    pillarCol: formatFamilyLocationPillar(node.location),
    slotCol: formatFamilyLocationSlot(node.location),
    badge: formatFamilyLocationBadge(node.location),
  };
}
