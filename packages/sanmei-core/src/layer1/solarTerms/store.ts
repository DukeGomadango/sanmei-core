import type { SolarTermEntry, SolarTermsFile } from "./types.js";
import type { SolarTermId } from "./constants.js";

/**
 * メモリ上の節入りマスタ。`entries` は `instantUtcMs` 昇順。
 */
export class SolarTermStore {
  readonly meta: SolarTermsFile["meta"];
  private readonly entries: readonly SolarTermEntry[];

  constructor(data: SolarTermsFile) {
    this.meta = data.meta;
    if (!Array.isArray(data.entries) || data.entries.length === 0) {
      throw new Error("SolarTermStore: entries must be non-empty array");
    }
    this.entries = [...data.entries].sort((a, b) => a.instantUtcMs - b.instantUtcMs);
  }

  get all(): readonly SolarTermEntry[] {
    return this.entries;
  }

  /** 時刻 &lt; 節入りなら -1、否则最後の &lt;= instantMs の index */
  private indexAtOrBefore(instantUtcMs: number): number {
    const arr = this.entries;
    let lo = 0;
    let hi = arr.length - 1;
    let ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid]!.instantUtcMs <= instantUtcMs) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  entryAtOrBefore(instantUtcMs: number): SolarTermEntry | undefined {
    const i = this.indexAtOrBefore(instantUtcMs);
    return i < 0 ? undefined : this.entries[i];
  }

  /** 直近の「節」（立春等）エントリ — MONTH_START_TERM_IDS のうち instant &lt;= t で最大 */
  monthSectionEntryAtOrBefore(instantUtcMs: number, monthTermIds: Set<SolarTermId>): SolarTermEntry | undefined {
    const i = this.indexAtOrBefore(instantUtcMs);
    for (let k = i; k >= 0; k--) {
      const e = this.entries[k]!;
      if (monthTermIds.has(e.termId)) return e;
    }
    return undefined;
  }

  /** 指定 id の全イベント（年ごと）— 範囲内 */
  entriesByTermId(termId: SolarTermId): SolarTermEntry[] {
    return this.entries.filter((e) => e.termId === termId);
  }

  /** ある暦年の立春（その前後で最も近い lichun。概ね2〜3月初） */
  lichunNearCalendarYear(calendarYear: number): SolarTermEntry | undefined {
    const candidates = this.entries.filter((e) => e.termId === "lichun");
    const t0 = Date.UTC(calendarYear, 0, 1);
    const t1 = Date.UTC(calendarYear, 5, 1);
    let best: SolarTermEntry | undefined;
    let bestDist = Infinity;
    for (const e of candidates) {
      if (e.instantUtcMs >= t0 && e.instantUtcMs < t1) {
        const d = Math.abs(e.instantUtcMs - Date.UTC(calendarYear, 1, 4));
        if (d < bestDist) {
          bestDist = d;
          best = e;
        }
      }
    }
    return best;
  }

  /** 直近の立春 instantUtcMs <= t（太陽年の切り口） */
  latestLichunAtOrBefore(instantUtcMs: number): SolarTermEntry | undefined {
    const i = this.indexAtOrBefore(instantUtcMs);
    for (let k = i; k >= 0; k--) {
      const e = this.entries[k]!;
      if (e.termId === "lichun") return e;
    }
    return undefined;
  }
}
