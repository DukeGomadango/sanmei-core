# Research 流派仕様（`sect: research`）

本書は `research` 流派の**単一仕様書**である。  
運用ログ・探索履歴は [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) を参照し、実装判断は本書を正とする。

---

## 1. 目的と適用範囲

- 目的: 主流派（`takao` 等）から独立した検証用流派として、Layer1〜Layer3 の計算仕様を一気通貫で固定する。
- 適用: `systemConfig.sect = "research"` かつ `rulesetVersion = "research-v1"`。
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

### 4.3 守護神/忌神

- ruleset の静的マトリクスで決定する。

### 4.4 Phase L2c（`energyData` / `destinyBugs`）

- `energyData` と `destinyBugs` は Layer2c で算出する。
- 入力は **位相法・虚気を加味しない素の命式**（Layer1 + Layer2a/b の結果）に限定する。
- Layer3a（位相法・虚気）の結果を L2c に逆流させない。
- `research-v1` の暫定規約として、`energyData` の重みは `mock-v1` 相当の重み系を流用可とする（出典レベルは `L2/L1` 扱い）。

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

---

## 6. Layer3b 仕様（格法）

- `allowGohouInKaku` の反映境界は未確定。
- Layer3a の結果を入力に格法を判定する。
- `research-v1` では最小構成で接続点のみ固定する。

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
- 蔵干閾値の `L0` 確定
- 二十八元配置の `L0` 確定

ロードマップ:
1. `L2/L1` 実装を先行
2. 一次本文または監修メモで `L0` へ昇格
3. 主流派反映は `L0` 到達後のみ

---

## 12. 実装チェックリスト

- [ ] `ruleset` に `sourceLevel/sourceId/sourceRevision` を追加
- [ ] 位相法 `kind` と組合せ表を JSON 化
- [ ] 蔵干閾値テーブルを JSON 化（正規化済み）
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

