# フェーズ2: 本番 ruleset（`takao-v1`）と大運本算法

**ステータス**: 計画・手順の正本（実装は監修または確定仕様の到着後に本格着手）。フェーズ1（BFF・HTTP 契約・mock 回帰）は完了済みを前提とする。

**本書の位置づき**: [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md)・[ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md) に**抵触しない**実装ロードマップ。細部の「正解」は [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) や監修入力に従う。

---

## 1. ゴール

- **`rulesetVersion: takao-v1`（仮名、以下同）** をバンドルし、[calculate.ts](../packages/sanmei-core/src/calculate.ts) 経路で **mock 以外の学派ルール**として選択可能にする。
- **`dynamicTimeline`（特に大運 `daiun`）** を、`timelineMock` 中心のプレースホルダから、**ruleset で定義された算法**に置き換える（年運・月運・天中殺連携は requirements §6.3・OPEN-QUESTIONS と整合）。

**前提（合意）**:

- 端数・起算・順逆行・性別寄りの扱いなどは **監修データ（または承認済み仕様）依存**。机上演算だけで確定できない部分は JSON／テスト期待に**書かない**。
- **`takao-v1.json` の取り込み（Zod）** と **`resolveDynamicTimeline` の本算法化**は **同一マイルストーン**で進める（片方だけ先に完了させない）。中途半端な版で UI／BFF から誤解を招かないため。

---

## 2. 監修なしで進められること・進めないこと

| 区分 | 内容 |
|------|------|
| **先行可能（土台）** | ディレクトリ・`BundledRuleset` の `union` 布石、`rulesetVersion` 分岐の関数構造、`bundledRulesets.ts` の単一ソース化リファクタ、ドキュメント・命名の固定 |
| **本実装に必須** | 大運の具体算法、丸め、`daiun` 期待 JSON、監修ゴールデン（入力／期待の明示ペア） |
| **フロントと並行** | BFF の `POST /api/v1/calculate` 契約は安定しているため、**mock `rulesetVersion` 前提の UI** は並行検討してよい。`takao-v1` 本体は本フェーズ完了後に切り替える想定 |

---

## 3. データ（`takao-v1.json`）

1. [SECT-RULESET-MATRIX.template.md](./SECT-RULESET-MATRIX.template.md) の **大運・起算・順逆行** など確定行を、**機械可読 JSON** に落とす（例: `daiunRounding`, `daiunStartRule`, `genderDirection` 等。名称は実装時に Zod と一緒に確定）。
2. 配置: [packages/sanmei-core/src/data/rulesets/](../packages/sanmei-core/src/data/rulesets/) に **`takao-v1.json`**（ファイル名はリリース前に確定してよい）。
3. [BundledRulesetSchema](../packages/sanmei-core/src/schemas/rulesetMockV1.ts) を **`z.union` 拡張**（または takao 専用スキーマ＋ union）。**optional → 必須化**の段階移行は可だが、`calculate` が参照するキーについてはレジストリと Zod を同期すること。

---

## 4. コード

1. [resolveDynamicTimeline.ts](../packages/sanmei-core/src/layer2/resolveDynamicTimeline.ts)
   - **分岐**: 既存 mock（満年齢・`timelineMock`）と **takao 本算法**（例: 日数÷3＋丸め規則は ruleset 明記）。
   - 判別子: `rulesetVersion` または `BundledRuleset` の `meta`／discriminator（union 化に合わせる）。

2. [bundledRulesets.ts](../packages/sanmei-core/src/layer2/bundledRulesets.ts)
   - **`takao-v1` の登録**。
   - **二重管理の解消**: バージョン列挙・キャッシュキー・import 先を **単一ソース**に寄せる（実装時に現行 `mock-v1` / `mock-internal-v2` と同様のパターンへ統一）。

3. **任意（付随改善）**: [mapCalendarFailure](../packages/sanmei-core/src/calculate.ts) まわりで **暦例外と `INVALID_TIMEZONE` の分離**を整理し、BFF 統合テストで 4xx／5xx の意図を検証しやすくする。

---

## 5. テスト・ゴールデン

| 種別 | 方針 |
|------|------|
| **mock（`mock-v1` 等）** | 既存どおり **スナップショット**＋コア単体テスト。BFF 経由の回帰も可 |
| **監修（`takao-v1`）** | **入力／期待を明示 JSON** で保持（例: `fixtures/supervised/` またはコア `__fixtures__` 配下の専用ディレクトリ）。**Vitest の `-u` による期待の機械更新は禁止**（承認フローでのみ差分を取る） |
| **IMPLEMENTATION の運用** | [IMPLEMENTATION.md](./IMPLEMENTATION.md) §3 の「監修データとスナップショット」に従う |

---

## 6. 推奨スプリント順（目安）

| 順序 | 成果物 |
|------|--------|
| 完了 | フェーズ1: BFF・§7 エラーマップ・mock 回帰・最小 Playground |
| 並行可 | フロント（mock 前提）、スナップ運用の追加ゴールデン入力（BFF 経路） |
| 本フェーズ本番 | `takao-v1` スキーマ＋バンドル＋`resolveDynamicTimeline` 本実装＋**監修フィクスチャ** |

---

## 7. リスクと緩和

| リスク | 緩和 |
|--------|------|
| スナップが監修誤差を固定化 | 監修は明示フィクスチャのみ。mock だけスナップ |
| ruleset と算法のリリース時期ズレ | **データ取り込みと `resolveDynamicTimeline` を同マイルストーン**にする |
| 学派行列と JSON のズレ | 変更時は [SECT-RULESET-MATRIX.template.md](./SECT-RULESET-MATRIX.template.md) と diff を PR で可視化 |

---

## 8. 関連ドキュメント

- 元となった作業メモ: [.cursor/plans/bff_http_と次期本番_773b957a.plan.md](../.cursor/plans/bff_http_と次期本番_773b957a.plan.md)（フェーズ2節は本書へ集約。**詳細は本書を正**とする）
- API 契約: [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §6.3・§7
- 未確定論点: [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md)

---

## 9. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2026-03-30 | 初版（フェーズ2を Cursor 計画から Docs へ移し、`IMPLEMENTATION`・`Docs/README` から参照） |
