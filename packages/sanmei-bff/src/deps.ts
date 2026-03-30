import {
  createJodaCalendarPort,
  loadBundledSolarTerms,
  type CalculateDeps,
} from "@sanmei/sanmei-core";

export function createCalculateDeps(): CalculateDeps {
  return {
    solarTermStore: loadBundledSolarTerms(),
    port: createJodaCalendarPort(),
  };
}
