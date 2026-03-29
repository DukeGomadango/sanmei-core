import type { SolarTermId } from "./constants.js";

export type SolarTermEntry = {
  termId: SolarTermId;
  longitudeDeg: number;
  /** Unix epoch milliseconds, UTC */
  instantUtcMs: number;
};

export type SolarTermsFileMeta = {
  ephemerisBundleId: string;
  generatedAt: string;
  rangeStartYear: number;
  rangeEndYear: number;
  entryCount: number;
  contentSha256?: string;
};

export type SolarTermsFile = {
  meta: SolarTermsFileMeta;
  entries: SolarTermEntry[];
};
