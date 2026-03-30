function FlagCell({ label, value }: { label: string; value: boolean }) {
  return (
    <td className="border border-border/80 px-2 py-1.5 text-sm whitespace-nowrap">
      <span className="text-muted-foreground">{label}</span>
      <span className={`ml-2 font-medium ${value ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
        {value ? "はい" : "いいえ"}
      </span>
    </td>
  );
}

export function TenchuSatsuStatusWidget({
  tenchu,
  hasCalculateResult,
}: {
  tenchu: Record<string, unknown> | null | undefined;
  hasCalculateResult: boolean;
}) {
  if (!hasCalculateResult) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">天中殺ステータス</h3>
        <div className="text-sm text-muted-foreground">計算を実行すると表示されます。</div>
      </section>
    );
  }

  if (tenchu == null) {
    return (
      <section className="min-h-56 rounded-lg bg-card p-5">
        <h3 className="mb-4 text-base font-semibold">天中殺ステータス</h3>
        <div className="text-sm text-muted-foreground">
          このレスポンスに <code className="font-mono text-xs">dynamicTimeline.tenchuSatsuStatus</code>{" "}
          は含まれていません（未実装の mock、または該当 ruleset で省略）。
        </div>
      </section>
    );
  }

  const phase = typeof tenchu.phase === "string" ? tenchu.phase : "—";
  const sourceLevel = typeof tenchu.sourceLevel === "string" ? tenchu.sourceLevel : "—";
  const natal = tenchu.natal && typeof tenchu.natal === "object" ? (tenchu.natal as Record<string, unknown>) : null;
  const dynamic = tenchu.dynamic && typeof tenchu.dynamic === "object" ? (tenchu.dynamic as Record<string, unknown>) : null;
  const destinyBugsRaw = tenchu.destinyBugs;
  const destinyBugs = Array.isArray(destinyBugsRaw) ? (destinyBugsRaw as unknown[]) : [];

  const natalYear = natal && typeof natal.yearPillarKey === "string" ? natal.yearPillarKey : "—";
  const natalMonth = natal && typeof natal.monthPillarKey === "string" ? natal.monthPillarKey : "—";
  const natalDay = natal && typeof natal.dayPillarKey === "string" ? natal.dayPillarKey : "—";
  const yListed = Boolean(natal?.listedInShukumeiTenchusatsuYear);
  const mListed = Boolean(natal?.listedInShukumeiTenchusatsuMonth);
  const nNorm = Boolean(natal?.listedInAbnormalKanshiNormal);
  const nDark = Boolean(natal?.listedInAbnormalKanshiDark);

  return (
    <section className="min-h-56 rounded-lg bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">天中殺ステータス</h3>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm whitespace-nowrap">
        <div>
          <span className="text-muted-foreground">phase</span>{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{phase}</code>
        </div>
        <div>
          <span className="text-muted-foreground">sourceLevel</span>{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{sourceLevel}</code>
        </div>
        {destinyBugs.length > 0 ? (
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground">destinyBugs</span>{" "}
            <span className="font-mono text-xs">
              {destinyBugs.map(String).join(", ")}
            </span>
          </div>
        ) : null}
      </div>

      {natal ? (
        <div className="mb-4 overflow-x-auto">
          <div className="mb-2 text-xs font-medium text-muted-foreground">宿命（B1 テーブル照合）</div>
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <tbody>
              <tr>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap font-medium">柱</th>
                <td className="border border-border/80 px-2 py-1.5 font-mono whitespace-nowrap">年 {natalYear}</td>
                <td className="border border-border/80 px-2 py-1.5 font-mono whitespace-nowrap">月 {natalMonth}</td>
                <td className="border border-border/80 px-2 py-1.5 font-mono whitespace-nowrap">日 {natalDay}</td>
              </tr>
              <tr>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap font-medium align-top">
                  フラグ
                </th>
                <td colSpan={3} className="border border-border/80 p-0">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <FlagCell label="生年天中殺一覧" value={yListed} />
                        <FlagCell label="生月天中殺一覧" value={mListed} />
                      </tr>
                      <tr>
                        <FlagCell label="異常干支（明）" value={nNorm} />
                        <FlagCell label="異常干支（暗）" value={nDark} />
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {dynamic ? (
        <div className="overflow-x-auto">
          <div className="mb-2 text-xs font-medium text-muted-foreground">動態（B2・index 照合）</div>
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <tbody>
              <tr>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">dslVersion</th>
                <td className="border border-border/80 px-2 py-1.5 font-mono text-xs whitespace-nowrap">
                  {String(dynamic.dslVersion ?? "—")}
                </td>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">calendarYear</th>
                <td className="border border-border/80 px-2 py-1.5 whitespace-nowrap">
                  {String(dynamic.calendarYear ?? "—")}
                </td>
              </tr>
              <tr>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">年運 index</th>
                <td className="border border-border/80 px-2 py-1.5 whitespace-nowrap">
                  {String(dynamic.annualSexagenaryIndex ?? "—")}
                </td>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">大運フェーズ index</th>
                <td className="border border-border/80 px-2 py-1.5 whitespace-nowrap">
                  {String(dynamic.daiunCurrentPhaseIndex ?? "—")} /{" "}
                  {String(dynamic.daiunCurrentPhaseSexagenaryIndex ?? "—")}
                </td>
              </tr>
              <tr>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">年運窓</th>
                <td className="border border-border/80 px-2 py-1.5 whitespace-nowrap">
                  {String(dynamic.annualTenchuWindowActive ?? "—")}
                </td>
                <th className="border border-border/80 bg-muted/40 px-2 py-1.5 whitespace-nowrap">大運フェーズ窓</th>
                <td className="border border-border/80 px-2 py-1.5 whitespace-nowrap">
                  {String(dynamic.daiunPhaseTenchuWindowActive ?? "—")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {/* 将来キー：phase が B1 のみ等で dynamic が無い場合も、残りはデバッグ用に折りたたみ可能にしない */}
    </section>
  );
}
