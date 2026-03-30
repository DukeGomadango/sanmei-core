import type { DestinyBugCode } from "@sanmei/sanmei-core";

const CODE_LABEL: Partial<Record<DestinyBugCode, string>> = {
  SHUKUMEI_TENCHUSATSU_YEAR: "宿命天中殺（年）",
  SHUKUMEI_TENCHUSATSU_MONTH: "宿命天中殺（月）",
  IJOU_KANSHI_NORMAL: "異常干支（通常）",
  IJOU_KANSHI_DARK: "異常干支（暗干支）",
};

export function DestinyBugsWidget({
  codes,
  hasCalculateResult,
}: {
  codes: DestinyBugCode[] | null | undefined;
  /** 一度でも API 計算が返っているか（空配列と「未実行」の見分け用） */
  hasCalculateResult: boolean;
}) {
  if (!hasCalculateResult) {
    return (
      <section className="min-h-32 rounded-lg bg-card p-5" id="section-destiny-bugs">
        <h3 className="mb-4 text-base font-semibold">宿命フラグ（destinyBugs）</h3>
        <div className="text-sm text-muted-foreground">計算を実行すると表示されます。</div>
      </section>
    );
  }

  if (!codes || codes.length === 0) {
    return (
      <section className="min-h-32 rounded-lg bg-card p-5" id="section-destiny-bugs">
        <h3 className="mb-4 text-base font-semibold">宿命フラグ（destinyBugs）</h3>
        <div className="text-sm text-muted-foreground">該当する宿命フラグはありません。</div>
      </section>
    );
  }

  return (
    <section className="min-h-32 rounded-lg bg-card p-5" id="section-destiny-bugs">
      <h3 className="mb-4 text-base font-semibold">宿命フラグ（destinyBugs）</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        出生時点で確定する静的コード（年運・大運天中殺は別フィールド予定）。
      </p>
      <ul className="flex flex-wrap gap-2">
        {codes.map((c) => (
          <li
            key={c}
            className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900"
            title={c}
          >
            {CODE_LABEL[c] ?? c}
          </li>
        ))}
      </ul>
    </section>
  );
}
