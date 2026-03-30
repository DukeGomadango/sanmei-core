# Research 流派仕様（`sect: research`）

本書は `research` 流派の**単一仕様書**である。  
運用ログ・探索履歴は [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) を参照し、実装判断は本書を正とする。

---

## 1. 目的と適用範囲

- 目的: 主流派（`takao` 等）から独立した検証用流派として、Layer1〜Layer3 の計算仕様を一気通貫で固定する。
- 適用: `systemConfig.sect = "research"` かつ `rulesetVersion = "research-v1"`（基準）または **`"research-experimental-v1"`**（**拡展位相法5種**付きの並行バンドル。L1/L2/大運R1 は `research-v1` と同一、Layer3a が `isouhouExtended` を統合。`calculate.meta.warnings` に L2 注記）。
- 非目的: 主流派の監修済み仕様を上書きしない。`research` を既定値にしない。

---

## 2. 全体アーキテクチャ（L1→L3）

### 2.1 計算フロー（概略）

1. 入力検証（`sect`, `rulesetVersion`, TZ）
2. Layer1: 暦・三柱・`displayDepth`
3. Layer2: 蔵干採用、主星/従星/六親などの静的器
4. Layer3a: 位相法・虚気（相互作用）
5. Layer3b: 格法最終判定（`allowGohouInKaku`）
6. 出力整形（`meta` に source 警告を付与）

### 2.2 層責務

- Layer1: 暦境界・三柱算出・深さ算出
- Layer2: 出生時点で凍る静的命式
- Layer3a: 時点依存の相互作用
- Layer3b: 判定統合（格法）

---

## 3. Layer1 仕様（暦・三柱・深さ）

### 3.1 暦境界

- `context.timeZone` を基準に節入り境界を判定する。
- 日界はプロジェクト既定（民用日界）に従う。

### 3.2 三柱

- `insen` は年柱・月柱・日柱の三柱のみを採用する。
- 時柱は `research-v1` では扱わない。

### 3.3 深さ（`displayDepth`）

- `displayDepth` は 1-origin。
- 蔵干切替は `displayDepth` で判定する（Layer2 は再計算しない）。

### 3.4 異常系

- 暦変換不能、ruleset 欠損、境界矛盾は明示的エラーで返す。

---

## 4. Layer2 仕様（静的命式）

### 4.1 蔵干採用

- 各支の初元/中元/本元（または2段）を `displayDepth` で切替。
- 採用規則は ruleset テーブル参照を正とする。

### 4.2 主星・従星・六親

- 行列参照（ruleset）で決定する。
- 語彙は算命学体系を採用し、他術体系の ID を持ち込まない。
- **表示名**: 安定 ID（`MA_*` / `SU_*`）は ruleset バンドル内の **`starLabels`**（`packages/sanmei-core` の [researchStarLabels.ts](../packages/sanmei-core/src/layer2/researchStarLabels.ts) ＋ [researchStarTables.ts](../packages/sanmei-core/src/layer2/researchStarTables.ts)）で **220 キー全件**を生成し、行列セル値集合と一致させる。HTTP 応答では **`meta.display.starLabels`** に当該命式の主星5＋従星3に出た ID のみを載せる（採用: [PLAN-RESEARCH-YOUSEN-AND-TENCHU.md](./PLAN-RESEARCH-YOUSEN-AND-TENCHU.md) §3.1 **A1**）。研究系の値は **L2_SECONDARY**（アカデミー公開表ベースの漢字星名。監修 `takao-v1` とは別ライン）。
- **固有名取り込み時の表記**: Web 資料の漢字ゆれ（例: 天禄/天緑、天恍/天洸、竜/龍）は [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) **18.10.1** の正規化表に合わせる。公開表セル突合ログは [RESEARCH-STAR-MATRIX-DIFF-ITER28.md](./RESEARCH-STAR-MATRIX-DIFF-ITER28.md)。

### 4.3 守護神/忌神

- ruleset の静的マトリクスで決定する。

### 4.4 Phase L2c（`energyData` / `destinyBugs`）

- `energyData` と `destinyBugs` は Layer2c で算出する。
- 入力は **位相法・虚気を加味しない素の命式**（Layer1 + Layer2a/b の結果）に限定する。
- Layer3a（位相法・虚気）の結果を L2c に逆流させない。
- `research-v1` の暫定規約として、`energyData` の重みは `mock-v1` 相当の重み系を流用可とする（出典レベルは `L2/L1` 扱い）。

### 4.5 天中殺（`dynamicTimeline.tenchuSatsuStatus`）

- **B1**: `destinyBugRules` による宿命テーブル照合（年・月・日柱キーと `destinyBugs` スナップショット）。実装は [resolveTenchuSatsuStatus.ts](../packages/sanmei-core/src/layer2/resolveTenchuSatsuStatus.ts) を参照。JSON キー・`DestinyBugCode`・文献ラベルの対応は [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) **18.10.2**。
- **B2 DSL**（`ruleset.tenchuRules.b2`、`dslVersion: research-tenchu-b2-v1`）: 現時点では **年運の `sexagenaryIndex`** および **大運現在フェーズの `sexagenaryIndex`** が、ruleset に列挙した整数集合に含まれるかどうかの **機械照合のみ**。占術上の「天中殺期」の定義そのものではなく、**後から真理値表・スライド条件へ差し替え可能な足場**である。監修フローは [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) §4。
- 応答は `tenchuSatsuStatus.phase === "B2_DYNAMIC"` 時に `dynamic` オブジェクトを載せる。`meta.warnings` に B2 の限定事項を付与する。

---

## 5. Layer3a 仕様（位相法・虚気）

### 5.1 位相法 `kind`

- `SHIGO`, `HOSANUI`, `HANKAI`, `SANGOU`, `TAICHU`, `GAI`, `KEI`, `HA`

### 5.2 位相法組合せ表

**合法**
- `SHIGO`: `子-丑`, `亥-寅`, `戌-卯`, `酉-辰`, `申-巳`, `未-午`
- `HOSANUI`: `亥-子-丑`, `寅-卯-辰`, `巳-午-未`, `申-酉-戌`
- `SANGOU`: `申-子-辰`, `亥-卯-未`, `寅-午-戌`, `巳-酉-丑`
- `HANKAI`:
  - 水: `申-子`, `子-辰`, `申-辰`
  - 木: `亥-卯`, `卯-未`, `亥-未`
  - 火: `寅-午`, `午-戌`, `寅-戌`
  - 金: `巳-酉`, `酉-丑`, `巳-丑`

**散法**
- `TAICHU`: `子-午`, `丑-未`, `寅-申`, `卯-酉`, `辰-戌`, `巳-亥`
- `GAI`: `子-未`, `丑-午`, `寅-巳`, `卯-辰`, `申-亥`, `酉-戌`
- `KEI`: `子-卯`, `寅-巳`, `巳-申`, `申-寅`, `丑-未`, `未-戌`, `戌-丑`, `辰-辰`, `午-午`, `酉-酉`, `亥-亥`
- `HA`: `子-酉`, `午-卯`, `丑-辰`, `未-戌`

### 5.3 競合優先度（暫定）

1. `SANGOU`
2. `HANKAI`
3. `HOSANUI`
4. `SHIGO`
5. `TAICHU`
6. `KEI`
7. `GAI`
8. `HA`

### 5.3.1 `HANKAI` 補助属性（将来拡張予約）

- `kind: HANKAI` は維持したまま、将来拡張として `hasCentralBranch: boolean` を扱える設計を推奨する。
- 定義:
  - `true`: `子/卯/午/酉` の旺支を含む半会
  - `false`: 旺支を含まない半会
- 本属性は `research-v1` では必須出力にしないが、L3a/L3b 分岐の安全弁としてスキーマ予約してよい。

### 5.4 虚気

- `kyoki` の発火条件は未確定領域とし、feature gate 下で扱う。
- ただし API 契約は固定する:
  - 発火時は `shadowYousen` 相当オブジェクトを **元の `yousen` とは別フィールド**で返す
  - `yousen` を上書きしない
  - 不発火時は `kyoki = null`（または未成立を明示）
- `interactionRules` には任意で `resolutionMeta`（`ruleSetId` / `priorityVersion` / `sourceLevel`）を持てるようにし、研究段階の判定根拠を追跡可能にする。

---

## 6. Layer3b 仕様（格法）

- Layer3a の結果を入力に格法を判定する。
- `research-v1` では次の契約を固定する:
  - `kaku.candidates[]`: 成立候補（全件保持）
  - `kaku.resolved[]`: 最終採用（1件でも配列）
  - `kaku.suppressed[]`: 棄却理由付きリスト
  - `kaku.meta`: `ruleSetId` / `priorityVersion` / `sourceLevel` / `allowGohouInKakuApplied` / `evaluateShadowProfileApplied`
- `allowGohouInKaku` は `GOHOU` タグ候補の suppress 判定に用いる。
- `evaluateShadowProfile` は ruleset 側フラグで制御し、**M3既定値は `false`（kyoki は格法評価対象外）** とする。

---

## 7. ruleset データモデル

### 7.1 必須メタ

- `sourceLevel`
- `sourceId`
- `sourceRevision`

### 7.2 研究警告

- `sourceLevel < L0` のルールを使用した場合、`meta` に警告を付与する。

### 7.3 バージョン運用

- `research-v1`, `research-v1.1` のように差分管理する。

---

## 8. 出典レベルと確定度

| レベル | 定義 | research 実装 |
|---|---|---|
| `L3_UNVERIFIED` | 断片情報のみ、独立照合なし | 不可 |
| `L2_SECONDARY` | 独立した公開解説2系統以上で一致 | 可（実験） |
| `L1_PRIMARY_IDENTIFIED` | 一次資料の所在（版・巻・書誌）を特定 | 可（実験） |
| `L0_PRIMARY_VERIFIED` | 一次資料本文（版・ページ付き）または監修メモで確定 | 可（本採用） |

- 主流派へ昇格する値は `L0` 必須。

---

## 9. 蔵干・二十八元仕様（research 草案）

### 9.1 正規化規則

- `displayDepth` は 1-origin。
- 区間は `[start,end]` 形式（`INF` 可）へ正規化。
- スロット名は算命学特化の `shoGen` / `chuGen` / `honGen` を正とする。
- 2段構成の支は `chuGen = null` または `honGen = null` を明示する。

### 9.2 閾値テーブル（草案）

- `子`: `shoGen[1,INF]`
- `丑`: `shoGen[1,9]`, `chuGen[10,12]`, `honGen[13,INF]`
- `寅`: `shoGen[1,7]`, `chuGen[8,14]`, `honGen[15,INF]`
- `卯`: `shoGen[1,INF]`
- `辰`: `shoGen[1,9]`, `chuGen[10,12]`, `honGen[13,INF]`
- `巳`: `shoGen[1,5]`, `chuGen[6,14]`, `honGen[15,INF]`
- `午`: `shoGen[1,19]`, `chuGen[20,INF]`, `honGen=null`
- `未`: `shoGen[1,9]`, `chuGen[10,12]`, `honGen[13,INF]`
- `申`: `shoGen[1,10]`, `chuGen[11,13]`, `honGen[14,INF]`
- `酉`: `shoGen[1,INF]`
- `戌`: `shoGen[1,9]`, `chuGen[10,12]`, `honGen[13,INF]`
- `亥`: `shoGen[1,12]`, `chuGen[13,INF]`, `honGen=null`（暫定）

注: 上表は `L2/L1` ベース。`L0` 到達時に更新する。

---

## 10. テスト戦略（層別）

- `secondary` 系: `L2/L1` ルールの回帰
- `primary` 系: `L0` 到達後の確定
- 最低ケース:
  1. 成立（位相法単独）
  2. 不成立
  3. 競合（優先度）
  4. 蔵干境界（日数切替）

---

## 11. 未確定事項とロードマップ

- `kyoki` 発火条件
- `allowGohouInKaku` の格法反映境界
- 位相法の拡張集合（干合/納音/律音/天剋地冲/大半会）を `research-v1.1` 以降でどこまで採用するか
- 位相法の適用スコープ（命式内のみ / 命式×大運 / 命式×年運）の層境界
- 蔵干閾値の `L0` 確定
- 二十八元配置の `L0` 確定
- 大運本算法（起算・順逆行・端数処理）の `L0` 確定

ロードマップ:
1. `L2/L1` 実装を先行
2. 一次本文または監修メモで `L0` へ昇格
3. 主流派反映は `L0` 到達後のみ

注（Iteration 19）:
- 位相法拡張集合（干合/納音/律音/天剋地冲/大半会）の**カテゴリ登録**は `ADOPTED-R1-SECONDARY` として研究採用可。
- ただし成立真理値・競合優先度・抑制条件は未確定のため、feature gate で段階導入する。

---

## 12. 大運本算法（research での扱い）

### 12.1 目的

- `research` では「大運本算法そのもの」を独立ルールとして扱い、位相法・蔵干と同じ `sourceLevel` 運用に乗せる。
- 本節は `takao-v1` 本番実装の前段として、仕様収束を早めるための research 側アンカーとする。

### 12.2 ルールID（固定）

- `research-daiun-start-rule-v1`（起算規則）
- `research-daiun-direction-rule-v1`（順逆行規則）
- `research-daiun-rounding-rule-v1`（端数・丸め規則）
- `research-daiun-boundary-exception-v1`（境界例外）

### 12.3 最低入力と期待出力

- 入力: `birthDate`, `birthTime?`, `gender`, `context.timeZone`, `sect`, `rulesetVersion`, `nowUtcMs`
- 期待出力（最低）:
  - `dynamicTimeline.daiun.startAge`
  - `dynamicTimeline.daiun.direction`
  - `dynamicTimeline.daiun.phases[]`（開始年齢・干支インデックス）
  - `meta.warnings[]`（`sourceLevel < L0` の場合）

### 12.4 検証ポリシー（L2→L0）

- `L2_SECONDARY`: 独立2系統一致で `research` 限定運用可。
- `L1_PRIMARY_IDENTIFIED`: 版・巻・書誌を特定し、質問票へ locator を記録する。
- `L0_PRIMARY_VERIFIED`: 一次本文（版・ページ付き）または監修メモで値を確定し、主流派昇格可。

### 12.5 大運専用ゴールデン（研究系）

- `secondary`（実験）と `primary`（確定）を分離し、同名ケースの上書きを禁止する。
- `secondary` の期待値更新は可だが、`primary` は監修差分レビューなしに更新しない。
- `research` の暫定値を `takao` 系の期待値へコピーしない。

### 12.6 現在地（Iteration 11 時点）

- `research-daiun-start-rule-v1`: `PENDING-MEDIUM`
- `research-daiun-direction-rule-v1`: `PENDING-LOW`
- `research-daiun-rounding-rule-v1`: `PENDING-MEDIUM`
- `research-daiun-boundary-exception-v1`: `PENDING-MEDIUM`

注:
- 上記は `L2/L1` の実験運用ステータスであり、主流派昇格には `L0_PRIMARY_VERIFIED` を必須とする。
- 具体根拠と sourceId は `RESEARCH-SECT-RULESET-WORKFLOW.md` の Iteration 11 を正とする。

### 12.7 更新（Iteration 14 時点）

- `research-daiun-start-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-direction-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-rounding-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-boundary-exception-v1`: `ADOPTED-R1-SECONDARY`

暫定決定表（R1）:
- 順逆行: 年干陰陽 × 性別で判定（陽年男/陰年女=順、陰年男/陽年女=逆）
- 起算: 順は次節入日数、逆は前節入日数を `3` で除算
- 丸め: 四捨五入（`research-v1` R1）
- 補正: `0 -> 1歳運`, `11 -> 10歳運`

制約:
- `sourceLevel` は `L2_SECONDARY`。主流派昇格は不可。
- 本番 `takao` 反映には `L0_PRIMARY_VERIFIED`（一次本文または監修メモ）を必須とする。

### 12.8 実装反映（Iteration 15 時点）

- `research-v1` の `dynamicTimeline.daiun` は R1 本算法を使用する。
- 返却項目:
  - `startAge`
  - `direction`（`forward` / `backward`）
  - `startDayDiff`（起算日数）
  - `phases[]` / `currentPhase`
- 計算根拠:
  - 起算日数はローカル暦日の JDN 差分で算出
  - `debugTrace` に `startDayDiff` と `roundedStartAge` を記録
- `mock-v1` / `mock-internal-v2` は従来の `timelineMock` ロジックを維持する。

### 12.9 secondary ケース固定（Iteration 16 時点）

- `DAIUN-S-001` 〜 `DAIUN-S-005` をテストに実装済み
- `secondary` の固定対象:
  - 順逆判定
  - backward 境界遷移
  - 端数処理反映
  - 節入り境界日の非負日数
  - `startAge` クランプ（`1..10`）
- `primary` ケースは監修確定まで予約状態を維持する。

### 12.10 primary 予約スロット（Iteration 17 時点）

- `DAIUN-P-001` 〜 `DAIUN-P-005` を `it.todo` で追加し、受け皿を固定した。
- 予約スロットの対象:
  - 起算規則（L0）
  - 順逆規則（L0）
  - 丸め規則（L0）
  - 境界例外（L0）
  - 監修E2E（L0）
- 昇格条件:
  - `L0_PRIMARY_VERIFIED` の根拠（`sourceId` + `locator`）が揃っていること
  - 監修期待値レビューを通過していること

---

## 13. 実装チェックリスト

- [ ] `ruleset` に `sourceLevel/sourceId/sourceRevision` を追加
- [ ] 位相法 `kind` と組合せ表を JSON 化
- [ ] 蔵干閾値テーブルを JSON 化（正規化済み）
- [ ] 大運本算法の質問票（起算・順逆行・端数・例外）を作成
- [ ] 大運ゴールデン（`secondary` / `primary`）を分離定義
- [ ] `meta` 警告（`sourceLevel < L0`）を返す
- [ ] `secondary` テストを追加
- [ ] `SECT-RULESET-MATRIX` と同期

---

## 付録A: 全流派共通ルール（暫定）

### A-1. 共通契約

- 入力は `sect` と `rulesetVersion` を必須とする。
- `context.timeZone` を基準に暦境界を判定する。
- `ruleset` は機械可読テーブルを正とし、コードへ定数を散在させない。

### A-2. 共通アーキテクチャ境界

- Layer2 は静的器、Layer3a は相互作用、Layer3b は格法最終判定。
- 依存順は `Layer2 -> Layer3a -> Layer3b` を守る。

### A-3. 共通語彙ガード

- 算命学 API の正規語彙を優先する。
- 他術体系の語彙・ID を契約へ持ち込まない。

### A-4. 共通品質ルール

- ルール値に `sourceLevel/sourceId/sourceRevision` を付与する。
- `sourceLevel < L0` は `meta` に警告を載せる。

### A-5. 共通エラー方針

- 必須データ欠損は明示的エラーで返す。
- 根拠不足の暫定値は黙って採用せず、警告または feature gate で扱う。

---

## 付録B: research 固有ルール（`research-v1`）

### B-1. 出典運用

- `research` は `L2/L1` でも実験実装を許可する。
- 主流派へ昇格する値は `L0` まで引き上げる。

### B-2. 位相法採用範囲

- `SHIGO`, `HOSANUI`, `HANKAI`, `SANGOU`, `TAICHU`, `GAI`, `KEI`, `HA`。

### B-3. 蔵干・二十八元運用

- 閾値は本書 `9.2` の草案を利用する。
- 表記揺れのある支は `sourceRevision` で追跡する。

### B-4. 禁止事項

- `research` の暫定値を主流派に混入させない。
- 四柱推命主体ソースを `sourceLevel` 判定に使わない。

---

## 付録C: 参照ドキュメント

- [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md)
- [SECT-RULESET-MATRIX.template.md](./SECT-RULESET-MATRIX.template.md)
- [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md)
- [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md)

