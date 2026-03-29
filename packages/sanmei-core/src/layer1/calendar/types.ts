/** タイムゾーン付きローカル日時を UTC エポック ms へ（実装はアダプタ） */
export type CalendarPort = {
  /** `birthDate` YYYY-MM-DD, optional HH:mm:ss 壁時計 @ timeZoneId */
  localWallTimeToUtcMs(
    birthDate: string,
    birthTime: string | null,
    timeZoneId: string,
  ): number;
  /** UTC ms を TZ のローカル暦日 YYYY-MM-DD に */
  utcMsToLocalDateString(utcMs: number, timeZoneId: string): string;
};
