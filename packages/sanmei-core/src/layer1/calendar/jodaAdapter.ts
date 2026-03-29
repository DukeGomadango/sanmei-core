import { DateTimeFormatter, Instant, LocalDate, LocalTime, ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import type { CalendarPort } from "./types.js";

const DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
const TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

function parseBirthDate(s: string): LocalDate {
  return LocalDate.parse(s, DATE_FMT);
}

function parseOrMidnight(t: string | null): LocalTime {
  if (t == null || t === "") return LocalTime.MIDNIGHT;
  const parts = t.split(":");
  if (parts.length === 2) {
    return LocalTime.parse(`${parts[0]}:${parts[1]}:00`, TIME_FMT);
  }
  return LocalTime.parse(t, TIME_FMT);
}

/** デフォルト TZ 実装（@js-joda/timezone）。バンドル重い場合は CalendarPort の別実装に差し替え */
export function createJodaCalendarPort(): CalendarPort {
  return {
    localWallTimeToUtcMs(birthDate, birthTime, timeZoneId): number {
      const zone = ZoneId.of(timeZoneId);
      const date = parseBirthDate(birthDate);
      const tod = parseOrMidnight(birthTime);
      const zdt = date.atTime(tod).atZone(zone);
      return zdt.toInstant().toEpochMilli();
    },
    utcMsToLocalDateString(utcMs, timeZoneId): string {
      const zone = ZoneId.of(timeZoneId);
      const zdt = Instant.ofEpochMilli(utcMs).atZone(zone);
      return zdt.toLocalDate().format(DATE_FMT);
    },
  };
}
