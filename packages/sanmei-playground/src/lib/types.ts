export type Gender = "male" | "female";

export type ControlsState = {
  birthDate: string; // YYYY-MM-DD
  birthTime: string | null; // HH:mm or null
  gender: Gender;
  asOf: string; // YYYY-MM-DD
  timeZone: string; // IANA tz
  sect: string;
  rulesetVersion: string;
};

