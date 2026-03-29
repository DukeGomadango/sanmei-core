/**
 * グレゴリオ暦の暦日 → ユリウス日数（JDN、日界は整数日）。
 * Fliegel & Van Flandern (1968)。正午基準ではなく「暦日」の通算日として利用。
 */
export function gregorianToJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}
