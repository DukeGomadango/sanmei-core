# 研究流派の充実計画（陽占星名・天中殺）

**ステータス**: 計画の正本（実装前の合意・スプリント分割用）。**本番監修 `takao-v1`** のロードマップは [PHASE2-RULESET-AND-DAIUN.md](./PHASE2-RULESET-AND-DAIUN.md) を正とし、本書は **`rulesetVersion: research-v1` / `research-experimental-v1`**（および想定どおり `sect` と組み合わせ）にスコープを限定する。

**関連**: 流派の単一仕様 [RESEARCH-SECT-SPEC.md](./RESEARCH-SECT-SPEC.md)（Layer2 の主星・従星は **行列で starId を決める**とあるが、**表示名の正本**は本計画で追補する）。天中殺の方針骨子は [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 論点 **8**。`dynamicTimeline.tenchuSatsuStatus` の契約は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §6 を参照。

---

## 1. 現状整理（なぜ物足りないか）

| 項目 | 現状 | ユーザー影響 |
|------|------|----------------|
| 十大主星・十二大従星の**星名** | `starId`（例: `MA_0_6`, `SU_0_4`）は ruleset 行列から決まるが、**安定 ID → 日本語星名**のマッピングがバンドルに無い | Playground は `Dict.starLabel` が mock 形式しか解できず「候補N」「（未知）」寄りになる |
| **天中殺** | `layer2` スキーマに `tenchuSatsuStatus` はあるが、`calculate` 経路で**未設定** | 動的パネルが空欄・説明のみ。論点8の「API が機械的结果を返す」と未整合 |

結論: **星名不足は表示層＋ruleset データ不足**、**天中殺不足はコア算出・ruleset 定義不足**が主因（前会話の認識と一致）。

---

## 2. ゴール（この計画で「充実」と呼ぶ状態）

1. **研究 ruleset 選択時**、API 応答を **追加計算なしで**（または既存 `starId` のみから）**十大主星・十二大従星の表示用ラベル**をクライアントが確定できること。  
   - 推奨: **サーバが `rulesetVersion` と整合した表示名を返す or ruleset バンドル内にカタログを含め、単一ソースで再現可能にする**（フロント独自表は二重管理になりやすい）。
2. **`dynamicTimeline.tenchuSatsuStatus` に、ruleset が定義する範囲で機械的に埋まる**こと（最低限: スキーマとドキュメントで **最小フィールド集合**を固定し、ゴールデンで検証可能にする）。

---

## 3. トラック A: 主星・従星の表示名（星名カタログ）

### 3.1 設計の分岐（採用は実装スプリント0で確定）

**採用済み（2026-03-31、スプリント0）**

- **星名の載せ方**: **A1**。`ruleset.starLabels` を SSOT とし、HTTP では **`meta.display.starLabels` に当該命式の主5＋従3の ID のみ**（既存どおり）。
- **研究用 `starLabels` の意味**: **`sourceLevel: L2_SECONDARY`**。値は算命学アカデミー（2018）公開表に基づく漢字星名（`researchStarTables.ts`）＋従星は WORKFLOW **18.10.1** 相当の正規化。**本番監修 `takao-v1` の星名とは別ライン**（[PHASE2-RULESET-AND-DAIUN.md](./PHASE2-RULESET-AND-DAIUN.md)）。
- **`tenchuSatsuStatus` 最小キー**: REQ [§6.3.1](./REQUIREMENTS-v1.1.md) を正。

| 案 | 長所 | 短所 |
|----|------|------|
| **A1. ruleset バンドルに `starLabels`（starId → 文字列）を追加** | `rulesetVersion` と一体化・再現性が高い | JSON 肥大、`research-v1` / experimental で重複しうる |
| **A2. 別ファイル `research-star-catalog.json` をバージョン管理し Zod で取り込み** | ruleset とカタログの差分レビューが分離 | 二重の「どの版とペアか」を CI で固定する必要 |
| **A3. 規則ベース（`MA_a_b` / `SU_a_b` → 教科書順の星名テーブル）** | データ量が小さい | **流派・版で並びが違うと破綻**するため、research 以外への適用は慎重 |

**推奨（初期）**: **A1 または A2 のいずれかで、`rulesetVersion` と同じコミットで更新する単一ソース**とする。`mock-v1` は現状の Playground 辞書のまま変更しない（影響範囲を研究系に限定）。

### 3.2 実装ステップ（目安）

1. **棚卸し**: `research-v1` / `research-experimental-v1` が参照する**全 `starId` 値**を一覧化（行列スナップショットまたはテストで機械抽出）。**`mock-v1.json` の `mainStars` / `subordinateStars` のセル値集合**と **`starLabels` カタログのキー集合が一致する**ことをテストで CI 担保する（未定義 ID の実行時欠落・UI「未知」を防ぐ）。
2. **スキーマ**: `BundledRuleset`（または並列 import のカタログ）に **optional → 研究系では期待値あり** など段階移行可能な形で追加（[rulesetMockV1.ts](../packages/sanmei-core/src/schemas/rulesetMockV1.ts) の union 方針に合わせる）。既存バンドルは壊さないよう **`starLabels` は `.optional()`** で導入する。
3. **解決関数**: `resolveStarLabel(starId, rulesetMeta)` のような純関数（失敗時は現状どおり ID 表示）。
4. **I/O**:  
   - **最小**: `calculate` の `baseProfile.yousen` に **表示専用フィールドを増やさず**、`meta` や別ブロックで `starLabels` を返すか、**フロントがバンドル済みカタログを読む**かは **REQ/ARCHITECTURE で一度決める**（Proto 互換・BFF 契約）。  
   - **推奨寄り**: 応答 JSON 内に **研究用の `display` サブオブジェクト**を足し、Playground はそれを優先表示（サーバ単一ソース）。  
   - **ペイロード**: 既定では **`meta.display.starLabels` に「当該結果の主星5＋従星3」に出現した `starId` のみ**を載せる（BFF/フロントが結果描画に使うなら十分）。全カタログの毎リクエスト返却は不要に肥大化しうる。**デバッグ用に全量を返す**運用が必要ならフラグまたは非 production のみで切り替え可能にする。
5. **テスト**: `golden_research_v1`（または専用フィクスチャ）で **少なくとも 1 命式の主星5＋従星3 の表示名**を固定。
6. **ドキュメント**: [RESEARCH-SECT-SPEC.md](./RESEARCH-SECT-SPEC.md) §4.2 に「starId と表示名カタログの関係」を追記。[IMPLEMENTATION.md](./IMPLEMENTATION.md) §3 の ruleset 行を更新。

### 3.3 非ゴール（範囲外）

- 監修済み `takao-v1` の正式星名確定（別フェーズ2の入力待ち）。
- 虚気・shadow 系の星図ラベル（必要なら Layer3 別タスク）。

---

## 4. トラック B: 天中殺（`tenchuSatsuStatus`）

### 4.1 前提（OPEN-QUESTIONS 8 との整合）

- **条件の外部化**: スライド・境界条件は **ruleset の機械可能な表現**（JSON / DSL）に載せ、無限 `if` を避ける。
- **API の責務**: 機械的に確定するフラグ・期間・スコア等を **`tenchuSatsuStatus` に載せる**。ナラティブ占断はフロント委譲。
- **`destinyBugs` との役割分担**: [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) L2c 節どおり **宿命フラグは出生で凍る静的コード**、**年運／大運天中殺・スライドは `dynamicTimeline`**。実装時に命名とコード一覧を二重にしない。

### 4.2 実装ステップ（目安）

1. **最小スキーマ合意**: `z.record` のままでは検証が弱いため、`tenchuSatsuStatus` の **推奨キー**（例: `sourceLevel`, `natal`, `flags` 等）を **REQ または RESEARCH-SECT-SPEC に列挙**（監修ソースなしでも **research 用プレースホルダ**でよい）。**レスポンス側の Zod** は当面 **`z.object({ ...必須にしたいキー }).passthrough()`** で導入し、B1 で出力キーが安定した段階で **strict 化または明示キーへの絞り込み**を検討する（放置厳禁: B2 着手前に締切を決める）。
2. **ruleset ブロック**: `tenchuRules`（仮称）を research バンドルに追加。`takao-v1` では別ブロックになる想定で **型だけ共通化**。
3. **算出・責務**: **`resolveTenchuSatsuStatus`（仮称）の主入力は `insen` + `ruleset`（＋ B2 以降 `daiun` / `annual`）** とする。Layer2 で既に確定している `destinyBugs` は **再計算の代わりに read-only で参照**し、整合チェックや UI 向けの要約の材料にしてよいが、**B2 で必要な根拠情報は `destinyBugs` のコード列だけでは失われる**ため、算出本体を `destinyBugs` のみに依存させない（[resolveDestinyBugs.ts](../packages/sanmei-core/src/layer2/resolveDestinyBugs.ts) と同様の ruleset 表を共有する関数抽出が望ましい）。マージ場所: [resolveDynamicTimeline.ts](../packages/sanmei-core/src/layer2/resolveDynamicTimeline.ts) の後、[calculate.ts](../packages/sanmei-core/src/calculate.ts) で `dynamicTimeline.tenchuSatsuStatus` に載せる。
4. **段階導入**:  
   - **B0**: 空オブジェクトを返さない（`{}`）明示や debug フラグのみ  
   - **B1**: 宿命（年柱・月柱ベース）のみ機械判定  
   - **B2**: 年運・大運クロス（論点8の「スライド」条件が入った段階）
5. **テスト**: research 専用ゴールデン（入力・期待 `tenchuSatsuStatus`）。**`-u` スナップ運用禁止**は [PHASE2-RULESET-AND-DAIUN.md](./PHASE2-RULESET-AND-DAIUN.md) に準ずる。
6. **Playground**: [TenchuSatsuStatusWidget](../packages/sanmei-playground/src/widgets/TenchuSatsuStatusWidget.tsx) をキー設計に合わせて読みやすく（表形式・`whitespace-nowrap` 遵守）。

### 4.3 リスク

- 監修前に「ほぼ正しい」天中殺を出すと**誤信**を招く → `meta.warnings` と `sourceLevel` を必ず付与し、[RESEARCH-SECT-SPEC.md](./RESEARCH-SECT-SPEC.md) の注意書きを更新する。

---

## 5. 推奨スプリント順序

| 順 | トラック | 成果物 |
|----|-----------|--------|
| 0 | 合意 | 星名: A1/A2/A3 の決定。天中殺: 最小キー一覧を REQ か RESEARCH-SECT に追記 |
| 1 | A | カタログデータ＋Zod＋`resolveStarLabel`＋ゴールデン＋Playground 表示 |
| 2 | B1 | 静的（宿命）天中殺のみ、`tenchuSatsuStatus` 埋め込み |
| 3 | B2 | 年運・大運連携・スライド条件（ruleset DSL 準備済みが前提） |

トラック A は **仕様確定待ちが少なく、UX への効果が大きい**ため先行しやすい。トラック B は **OPEN-QUESTIONS 8 の DSL 化**がクリティカルパスになる。

### 5.1 フェーズ S3（B2）の前提: DSL / JSON 先行

**B2 の TypeScript 実装に入る前に**、`tenchuRules` 用の **JSON または DSL の構造**（真理値表、スライド成立条件、優先度）をドキュメントと Zod（ruleset 側）で **FIX** する。ハードコードの積み上げはシステムを硬直化させるため、**スキーマ定義 → サンプル ruleset 片 → ゴールデン**の順を推奨する。

---

## 6. 完了時のドキュメント同期（§7 観点）

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) §3（ruleset・`dynamicTimeline`・Playground）
- [RESEARCH-SECT-SPEC.md](./RESEARCH-SECT-SPEC.md) §4.2・動的節（天中殺）
- 必要なら [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) の論点8に「研究版で先行実装したフィールドセット」へのリンク

---

## 7. リサーチループ完了条件からの逆算（実行計画）

正本の定義: [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md)（**§4 実装ゲート**、**§10 実装可能**、**§12 出典レベル**、**§13 研究流派の完成**）。

### 7.1 ゴールを三段に分ける（何を「完了」と呼ぶか）

| 段 | 条件の出所 | 到達意味 | 主星・従星／天中殺での解釈 |
|----|------------|----------|--------------------------------|
| **G0: research 実験採用** | §10 の 1〜5（決定表・出典2・衝突方針・テスト3観点・レイヤ境界）に加え、`ADOPTED-R1-SECONDARY` 相当の明示（大運 [§17.10](./RESEARCH-SECT-RULESET-WORKFLOW.md) と同型） | `sourceLevel` は **`L2_SECONDARY` まで**。`meta.warnings` 前提でコードへ落とせる | 行列・B2 DSL は **真理値が固定**していれば実装可。星名カタログは **表示契約**として `ruleset`／`meta.display` と同期すれば足りる |
| **G1: §4 実装ゲート通過** | `status=ADOPTED`、`evidence` **2件以上（うち1件は一次または監修メモ）**、if/then 可能、`SECT-RULESET-MATRIX` 反映 | **そのルール単位では**「監修に近い確度」で実装を本採用扱いできる | 主星行列・従星行列の **各切片**、天中殺 **B1 各表・B2 のスライド条件**を **ruleId 単位**でゲートに通す |
| **G2: 「研究流派の完成」（§13）** | 位相法・蔵干に加え、**本計画領域も**出典レベル付きで ruleset に載り、テストが `sourceLevel` 別に分離し、MATRIX に research 列が載る、暫定は文書化 | 組織として `research-v1` を一段クローズできる状態 | 十大主星・十二大従星・`tenchuRules` を §13 の **1〜5 と同型の運用**（項目追加）で満たすことを目標にする |

**逆算の原則**: コードの「完成」ではなく、**ワークフロー上のゲート通過**を完了条件とする。実装はゲートの**後**または **G0 の範囲**に限定する。

### 7.2 共通バックログ（終わりから順にチェック）

次の **後ろから前** の順で埋める（漏れが出にくい）。

1. **テスト／ゴールデン**: §10-4 相当として、各 `ruleId` ごと **成立・不成立・競合（または境界）** の 3 観点を **先に** `calculate` フィクスチャまたはドキュメント上のケース ID に起票する。  
2. **衝突方針**: 主星・従星で「同一点に複数ラベルが立つ」等があれば §10-3。天中殺は B1∧B2・複数窓の優先を [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 論点8と突合。  
3. **決定表（if/then）**: §10-1。`MA_*`/`SU_*` は全セル、`tenchu` は B1 キーと B2 の入力（年干支 index・大運フェーズ・期間型）を表にする。  
4. **出典＋`sourceLevel`**: §12。G0 なら **独立2系・算命学文脈**（§15.2 の除外ポリシー遵守）。G1 なら **一次または監修メモを1件**必須。  
5. **ruleId レコード**: [WORKFLOW §6](./RESEARCH-SECT-RULESET-WORKFLOW.md) テンプレで `research-*` を追記（既存: `research-main-stars-vector-logic-v1`、`research-sub-stars-daystem-branch-v1`。天中殺は B1 表／B2 スライドを **複数 ruleId に分割**してよい）。  
6. **MATRIX・用語**: `SECT-RULESET-MATRIX.template.md` の research 列、`DOMAIN-GLOSSARY.md`、論点8へのリンク（[WORKFLOW §7](./RESEARCH-SECT-RULESET-WORKFLOW.md)）。

### 7.3 トラック別：十大主星・十二大従星

| 逆算ステップ | 成果物 |
|--------------|--------|
| ゴール（G1 理想） | 行列**決定表**の出典付き確定 → `starLabels`／表示はその副産物 |
| 現実ライン（G0） | **独立2系**で「日干×対象干→主星」「日干×支→従星」の**対応規則**が矛盾なく表になるまでリサーチし、`ADOPTED-R1-SECONDARY`＋`L2` で実装固定。行列スナップショットとカタログキー一致テストは維持 |
| 既存ルール起点 | WORKFLOW §8 の `research-main-stars-vector-logic-v1`、`research-sub-stars-daystem-branch-v1` を **status／evidence 列で回帰**（PENDING-LOW のままでは G0 も危うい） |

### 7.4 トラック別：天中殺

| 領域 | 逆算の「止め」 | 備考 |
|------|----------------|------|
| **B1**（宿命テーブル） | `destinyBugRules` の各リストが **どの文献のどの表／一覧**かを ruleId＋evidence で一意に説明できる | 既存 `resolveTenchuSatsuStatus` B1 出力と差分が出ないようゴールデンで固定 |
| **B2（現状 index 集合）** | 足場として G0 でよい。`research-tenchu-b2-v1` の**意味**（占術上の定義ではない）を SPEC／警告文で固定済みなら、集合の中身は research のみ差し替え可能 |
| **B2（本番＝スライド／期間）** | 論点8の DSL を **決定表化**してから §4 または G0 を通す。大運スプリントと同様に **監修質問票 → secondary ゴールデン → primary 予約** | 通過前に **真理値をカタログ化しない**（ハードコード禁止方針と整合） |

### 7.5 推奨スプリント順（リサーチ寄り）

| 順 | フォーカス | 完了の判据 |
|----|--------|------------|
| R0 | 天中殺 B1・主星・従星の **ruleId 洗い出し**と §7.2 のケース ID 起票 | 各領域でテスト3観点が**紙面上**そろう |
| R1 | 主星・従星の **L2 二系統照合**と決定表ドラフト | `research-main-*` / `research-sub-*` が **G0 候補**まで昇格 |
| R2 | 天中殺 B1 表の **出典付き**固定（G0 または G1 のどちらを狙うか明記） | MATRIX ／ OPEN-QUESTIONS 更新 |
| R3 | 論点8 DSL 草案と B2 **本実装**の切り分け | DSL が if/then 可能＋R0 の競合ケースに答える |
| R4 | G1（監修／一次）到達分のみ **ADOPTED** にし、§13 の「本計画項目」埋め | `research-v1` の完成定義を拡張してもよい |

実装スプリント（本書 **§5** の S0〜S3）と並走させる場合は **G0 未満の真理値は `meta.warnings` と「暫定」ラベルで縛る**こと。

---

## 8. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2026-03-31 | 初版（陽占星名カタログと `tenchuSatsuStatus` の二本立て計画） |
| 2026-03-31 | レビュー反映: 星名 API は主星5＋従星3の部分集合を既定、行列とカタログの集合一致を CI 明記、Zod は passthrough からの段階 strict、天中殺算出の主入力を `insen+ruleset` に明確化（`destinyBugs` は read-only 補助）、S3 は DSL 先行を節として追加 |
| 2026-03-31 | 実装着手: `starLabels` バンドル・`meta.display.starLabels`・`resolveTenchuSatsuStatus` B1・ゴールデン `golden_research_v1`・Playground `YousenWidget` 連携 |
| 2026-03-31 | S3 初版: `tenchuRules.b2`（`research-tenchu-b2-v1`）を Zod＋[bundledResearchV1Shared](../packages/sanmei-core/src/layer2/bundledResearchV1Shared.ts) に載せ、年運・大運 index 集合照合を B2 実装（真のスライドは DSL 拡張・監修待ち） |
| 2026-03-31 | §7 追加: ワークフロー完了条件（§4／§10／§12／§13）からの逆算プラン（G0〜G2・共通バックログ・トラック別・R0〜R4） |
| 2026-03-31 | リサーチ Iteration 27 追補: 主星・従星表記正規化、`destinyBugRules` B1 対応表、天中殺 B2 監修質問票（`WORKFLOW` 18.10 / `OPEN-QUESTIONS` 8） |
| 2026-03-31 | リサーチ Iteration 28: `research-tenchu-b1` を `PENDING-VERIFICATION`＋Stock 4 ページ紐付け、[RESEARCH-STAR-MATRIX-DIFF-ITER28.md](./RESEARCH-STAR-MATRIX-DIFF-ITER28.md) 新設、`TenchuRulesB2Schema` JSDoc 拡張メモ（`WORKFLOW` 18.11） |
| 2026-03-31 | リサーチ Iteration 29: 従星 S1 の 120 セル Vitest 突合（`researchStarMatrixDiff.test.ts`）・主星アカデミー表の数値×漢字整合。既知 S1 差分 4 セルを文書化（`WORKFLOW` 18.12） |
| 2026-03-31 | Iteration 29 追補: 主星の Z塾命名第二ソース＋数値表 Latin 検証、B1 `resolveTenchuSatsuStatusB1` 座標ゴールデン（`resolveTenchuSatsuStatusB1.test.ts`） |
| 2026-03-31 | Core/Playground 実装: `researchStarTables`＋漢字 `starLabels`、`RESEARCH_DESTINY_BUG_RULES_SUBSET`、Playground 天中殺表形式、REQ §6.3.1・PLAN §3.1 採用固定 |
