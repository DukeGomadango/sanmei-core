export type Gender = "male" | "female";

export type ControlsState = {
  birthDate: string; // YYYY-MM-DD
  birthTime: string | null; // HH:mm or null
  gender: Gender;
  asOf: string; // YYYY-MM-DD
  timeZone: string; // IANA tz
  sect: string;
  rulesetVersion: string;
  /** Layer3b: 合法を格に含めるか（コア `systemConfig.allowGohouInKaku`） */
  allowGohouInKaku: boolean;
};

