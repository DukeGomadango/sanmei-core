# 研究流派（`sect: research`）ルール策定ワークフロー

**目的**: 主流派（`takao` など）から独立した `research` を用意し、Layer3（位相法・虚気・格法）を検証しつつ、四柱推命等の他体系の語彙混入を防ぐ。  
**位置づけ**: 本書は「研究用ルールの作り方」の正本。API 契約は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md)、語彙境界は [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md)、学派差分表は [SECT-RULESET-MATRIX.template.md](./SECT-RULESET-MATRIX.template.md) を正とする。

---

## 1. 先に固定するルール（混線防止）

| 項目 | ルール |
|------|--------|
| 語彙 | 算命学語彙を正規語彙にする（例: 位相法、虚気、十大主星、六親）。四柱推命語（例: 十神、格局）を API の正規語彙にしない。 |
| 出典 | 各ルールに出典 ID を必須化する（未出典は採用しない）。 |
| ステータス | 各ルールは `ADOPTED` / `PENDING` / `REJECTED` のいずれかを持つ。 |
| 隔離 | `sect: research` と `rulesetVersion: research-v1` を主流派と分離し、既定値にしない。 |
| テスト | 研究用フィクスチャは監修ゴールデンと別系統で管理する。 |

---

## 2. リサーチ単位（1 ルール 1 レコード）

1 レコードは次の形で記録する。

| フィールド | 説明 |
|-----------|------|
| `ruleId` | 一意なルール ID（例: `research-isouhou-hankai-v1`） |
| `domainArea` | `isouhou` / `kyoki` / `kakuhou` / `timeline` など |
| `statement` | 機械実装可能な短文（曖昧語を避ける） |
| `inputs` | 判定に使う入力（例: 地支ペア、蔵干スロット、月支） |
| `expectedOutput` | 返す値（`kind`, `strength`, `scope` など） |
| `evidence` | 出典 ID の配列 |
| `status` | `ADOPTED` / `PENDING` / `REJECTED` |
| `notes` | 監修待ち・反証・実装上の注意 |

---

## 3. 出典テンプレート（必須）

`evidence` に指定する出典は、少なくとも次を埋める。

| 項目 | 説明 |
|------|------|
| `sourceId` | 例: `BOOK-TAKAO-YYYY-CH03-P120` |
| `type` | `book` / `paper` / `supervisor-note` |
| `title` | 資料名 |
| `locator` | 章・ページ・節・図番号など |
| `quotation` | 判定根拠の短い引用（必要最小限） |
| `confidence` | `HIGH` / `MEDIUM` / `LOW` |

**運用**:
- `confidence=LOW` のみで `ADOPTED` にしない。
- 相反する資料がある場合は `notes` に差分を残し、`PENDING` に留める。

---

## 4. 実装ゲート（コード化の前提）

次を満たしたルールだけ実装してよい。

- `status=ADOPTED`
- `evidence` が 2 件以上（最低 1 件は一次または監修メモ）
- `statement` が if/then で機械判定可能
- `SECT-RULESET-MATRIX` の `research` 列に反映済み

---

## 5. 最初のスコープ（推奨）

まずは Layer3a の最小セットから始める。

1. 位相法 1〜2 種（例: 半会、干合）
2. 虚気 1 条件（成立/不成立の 2 パターン）
3. 格法は `PENDING` で枠だけ定義（本判定は後続）

---

## 6. 記入用テンプレート

以下をコピーしてルール候補を追記する。

```md
### ruleId: research-xxxx-v1
- domainArea:
- statement:
- inputs:
- expectedOutput:
- evidence:
  - sourceId:
    type:
    title:
    locator:
    quotation:
    confidence:
- status: PENDING
- notes:
```

---

## 7. ドキュメント同期チェック（着手ごと）

- [ ] `Docs/SECT-RULESET-MATRIX.template.md` に `research` 列を追加/更新した
- [ ] `Docs/DOMAIN-GLOSSARY.md` の語彙境界に反していない
- [ ] `Docs/OPEN-QUESTIONS.md` の該当論点にリンクした
- [ ] `rulesetVersion` とテスト対象（research系）が一致している

## 7.1 ステータス運用ルール

- `PENDING-HIGH` は、`ADOPTED` 候補として優先レビューする。
- `PENDING-MEDIUM` は、追加出典（一次または監修メモ）を1件以上追加してから再判定する。
- `PENDING-LOW` は、他体系混線の疑いがあるため、デフォルトで実装対象外とする。

---

## 8. 初回ルール候補（PENDING 10件）

出典は、ユーザー提供レポート末尾の Works cited を `sourceId` 化して記録する。  
**注意**: 下記はすべて `PENDING`。`ADOPTED` へ昇格するまで実装の真理値として扱わない。

### 8.1 リサーチ再判定（2026-03-30）

- `PENDING-HIGH`: 算命学語彙との一致が高く、外部情報でも大筋一致。
- `PENDING-MEDIUM`: 算命学として妥当だが、学派差または一次性不足が残る。
- `PENDING-LOW`: 四柱推命等の混線リスクが高く、当面は採用保留。

### ruleId: research-core-three-pillars-v1
- domainArea: core-model
- statement: 陰占のルートデータは年柱・月柱・日柱の三柱を基本とする。
- inputs: birthDate, context.timeZone, solarTerms
- expectedOutput: insen.year/month/day が必須
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 2.2 干支オブジェクト定義
    quotation: 年干支・月干支・日干支の3要素（三柱）を導き出す
    confidence: MEDIUM
- status: PENDING-HIGH
- notes: 現行 `sanmei-core` の三柱前提と整合。時柱は研究対象外とする。

### ruleId: research-time-required-only-on-boundary-v1
- domainArea: calendar-boundary
- statement: 生時刻は常時必須とせず、境界判定に必要な場合のみ要求する。
- inputs: birthDate, birthTime, context.timeZone, solarTerms
- expectedOutput: boundary 条件時のみ時刻要求フラグ
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 1. 基本理念, 2.1 日界
    quotation: 算命学では原則時刻を必須としないが境界値処理は要設計
    confidence: MEDIUM
- status: PENDING-MEDIUM
- notes: 「時刻不要」の断定は避け、現行の `TIME_REQUIRED_FOR_SOLAR_TERM` と整合確認が必要。

### ruleId: research-day-boundary-config-flag-v1
- domainArea: calendar-boundary
- statement: 日界は 0時基準/23時基準を設定で切り替え可能な設計案として保持する。
- inputs: boundaryMode(0h|23h), birthDate, birthTime
- expectedOutput: 日干支算出に使う暦日
- evidence:
  - sourceId: SRC-KAKUYOMU-JIKANSHI-EP5
    type: paper
    title: 第5話 時干支（時柱）の出し方
    locator: 日界説明部分
    quotation: 23時境界と0時境界の流派差
    confidence: LOW
- status: PENDING-LOW
- notes: 子初換日（23時）は四柱推命系文脈との混線リスクが高い。研究流派では採用保留。

### ruleId: research-zokan-slot-model-v1
- domainArea: zokan
- statement: 各地支の蔵干は初元/中元/本元のスロット構造で保持する。
- inputs: branch
- expectedOutput: zokanSlots(shoGen, chuGen, honGen)
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 3.1 蔵干展開ロジック
    quotation: 初元・中元・本元の動的適用
    confidence: MEDIUM
- status: PENDING-HIGH
- notes: `DOMAIN-GLOSSARY` の語彙方針と一致。

### ruleId: research-zokan-day-switch-table-v1
- domainArea: zokan
- statement: 蔵干採用は節入りからの経過日数テーブルで切り替える。
- inputs: displayDepth, branch, sect, rulesetVersion
- expectedOutput: activeZokanSlot
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 3.1 蔵干展開ロジック
    quotation: 経過日数に応じて初元/中元/本元を動的適用
    confidence: MEDIUM
  - sourceId: SRC-SANMEIGAKU-ACADEMY-ZOKAN-2017
    type: paper
    title: 算命学アカデミーオンライン｜蔵干の計算と節入り時刻
    locator: 本文の申・戌・亥の例示
    quotation: 申は初元10日/中元11-13日/本元14日以降、戌は初元9日/中元10-12日/本元13日以降、亥は13日境界の記述あり
    confidence: MEDIUM
- status: PENDING-VERIFICATION
- notes: 具体日数は公開解説の独立2系統で再確認できたが、学派一次資料としては強度不足。`secondary-verified` として research 限定運用し、監修メモまたは教材一次資料（版付き）で照合が取れるまで主流採用しない。

### ruleId: research-main-stars-vector-logic-v1
- domainArea: main-stars
- statement: 十大主星は日干と対象干の五行関係+陰陽一致で決定する。
- inputs: dayStem, targetStem
- expectedOutput: mainStarId
- evidence:
  - sourceId: SRC-SARUMEIGAKU-ARCHIVE-20743
    type: paper
    title: 十大主星・十二大従星の算出を学ぶ回
    locator: 十大主星算出解説
    quotation: 五行関係と陰陽一致で主星を導く
    confidence: LOW
- status: PENDING-MEDIUM
- notes: 実装モデルとして妥当だが、主星対応行列の中身は学派差が大きいため監修根拠で固定する。

### ruleId: research-sub-stars-daystem-branch-v1
- domainArea: subordinate-stars
- statement: 十二大従星は日干×地支の対応で算出する。
- inputs: dayStem, yearBranch, monthBranch, dayBranch
- expectedOutput: subordinateStars(3 slots)
- evidence:
  - sourceId: SRC-SHUGAKUIN-BASICS-SICHUUSUIMEI
    type: book
    title: 算命学と四柱推命の違い - 朱学院
    locator: 算命学の命式説明部
    quotation: 日干と地支の関係で従星を読む枠組み
    confidence: LOW
- status: PENDING-LOW
- notes: 算出枠は妥当だが、出典強度が弱く他体系（十二運ロジック）との混線注意。監修資料で補強するまで固定しない。

### ruleId: research-bodymap-node-topology-v1
- domainArea: family-bodymap
- statement: 陽占のノードは方位/部位メタデータ付きで評価し、単独ノードで人格断定しない。
- inputs: mainStars, subordinateStars, familyNodes
- expectedOutput: bodyMapNodes with position metadata
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 5. 人体星図へのマッピング
    quotation: 8つの星を全体ネットワークとして評価する
    confidence: MEDIUM
- status: PENDING-HIGH
- notes: 現行 `familyNodes` の座標必須方針と親和性が高い。

### ruleId: research-isouhou-pattern-catalog-v1
- domainArea: isouhou
- statement: 位相法は合法/散法のパターンカタログを ruleset で管理し、成立時に interaction を返す。
- inputs: natalBranches, dynamicBranches, ruleset.isouhouPatterns
- expectedOutput: interactionRules.isouhou[]
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 7.2 陰占・位相法
    quotation: 三合会局/支合/対冲/刑/害/破のパターン判定
    confidence: MEDIUM
  - sourceId: SRC-SHUGAKUIN-INSENHOU
    type: book
    title: 朱学院｜陰占法（位相法）
    locator: 位相法の説明
    quotation: 位相法には壊れる散法とまとまる合法がある
    confidence: HIGH
  - sourceId: SRC-SANMEI-STOCK-TRIANGULAR-FUSION
    type: paper
    title: 算命学Stock｜三合会局
    locator: 三合会局とは
    quotation: 三合会局は4パターン（申子辰/亥卯未/寅午戌/巳酉丑）
    confidence: MEDIUM
  - sourceId: SRC-SANMEI-STOCK-OPPOSITION
    type: paper
    title: 算命学Stock｜対冲
    locator: 対冲とは
    quotation: 対冲は対称軸上の組合せで正面衝突を意味する
    confidence: MEDIUM
- status: PENDING-VERIFICATION
- notes: 用語カテゴリは算命学として妥当。組合せ表は独立2系統で大半照合済み（`HA` を含む）が二次情報中心のため `secondary-verified` 扱い。監修一次資料が取れるまで主流採用は留保。

### ruleId: research-kyoki-overlay-separation-v1
- domainArea: kyoki
- statement: 虚気や位相による影響は baseProfile を上書きせず、別フィールドで返す。
- inputs: baseProfile, isouhouResult, kyokiRules
- expectedOutput: kyoki (or shadow profile) as separate structure
- evidence:
  - sourceId: SRC-REPORT-2026-03-30
    type: supervisor-note
    title: 算命学システム化のための要件定義および計算ロジック構造解析レポート
    locator: 7.2 ハイブリッド評価
    quotation: 陰占フラグが陽占出力へ干渉する統合判定
    confidence: MEDIUM
- status: PENDING-MEDIUM
- notes: `DOMAIN-GLOSSARY` の Layer3 方針（shadow を別返却）と整合。

---

## 9. リサーチ強化ループ（運用ログ）

### Iteration 1（2026-03-30）

**対象**:
- `research-zokan-day-switch-table-v1`
- `research-isouhou-pattern-catalog-v1`

**実施**:
- 公開情報で位相法カテゴリ（合法/散法）と代表組合せの再確認
- 算命学系サイト（朱学院・算命学Stock）で語彙整合の確認
- 蔵干「日数閾値」の一次根拠探索

**結果**:
- `research-isouhou-pattern-catalog-v1`: 出典を3件追加。`PENDING-HIGH` を維持。
- `research-zokan-day-switch-table-v1`: 公開情報で閾値そのものの一次根拠が不足。`PENDING-HIGH` → `PENDING-MEDIUM` に再評価。

**判定メモ**:
- 位相法カテゴリの存在自体は算命学として妥当性が高い。
- 蔵干切替日数は「概念」は妥当だが、実装に必要な数値表は監修一次情報が必須。

**次ループの探索クエリ候補**:
1. 監修メモまたは教材一次資料から「地支ごとの切替日数表」を抽出可能なソース
2. 位相法の採用サブセット（支合/半会/三合会局/対冲/刑/害/破）の優先順位
3. `allowGohouInKaku` と位相法の接続条件（格法への反映境界）

### 全体監査（正当性再確認 / 2026-03-30）

**判定軸**:
1. 出典の一次性（監修文書・公式教材・版付き資料）
2. 他体系混入リスク（四柱推命語彙・ロジック）
3. 再現性（同一ルールを独立ソースで再確認可能か）

**監査結果（重要）**:
- `ADOPTED` 相当としていた2件（位相法カタログ、蔵干日数subset）は、いずれも一次性不足。
- 公式系サイトでカテゴリ概念は確認できるが、実装に必要な数値・真理値の固定根拠が弱い。
- したがって両件を `PENDING-VERIFICATION` に降格し、採用留保とする。

**採用再開条件**:
- 監修メモ/教材一次資料を sourceId 化して追加
- 同一ルールに対して独立2系統以上で矛盾がないことを確認
- ルール表に「版（revision）」を付与

### Iteration 4（2026-03-30）

**対象**:
- `research-isouhou-pattern-catalog-v1`
- `research-zokan-day-switch-table-v1`

**実施**:
- 公式系（朱学院）で位相法カテゴリの再確認
- 独立ソース（自然法算命学）で位相法の組合せを照合
- 蔵干日数と二十八元配置の一次資料探索を継続

**結果**:
- 位相法のうち以下は**部分検証済み**:
  - `SHIGO`（支合6組）
  - `TAICHU`（冲動/対冲6組）
  - `GAI`（害6組）
  - `KEI`（刑の基本組）
- `HA`（破）は独立照合が弱く、未検証のまま。
- 蔵干日数は依然として版付き一次資料が不足（`PENDING-VERIFICATION` 維持）。

**追加 sourceId（Iteration 4）**:
- `SRC-SHUGAKUIN-ISOUHOU`
- `SRC-SHIZENHOU-SHIGO`
- `SRC-SHIZENHOU-CHUDO`
- `SRC-SHIZENHOU-GAIHOU`
- `SRC-SHIZENHOU-KEIHOU`

### Iteration 5（2026-03-30）

**対象**:
- `research-isouhou-pattern-catalog-v1` の `HA`
- `research-zokan-day-switch-table-v1`（二十八元/蔵干表）

**実施**:
- `HA` の組合せを別系統（ahikaga）で照合
- 二十八元/蔵干表を別系統（oyamasimizudaishi）で照合

**結果**:
- `HA` は 4組（`子-酉`, `午-卯`, `丑-辰`, `未-戌`）で二次情報2系統一致
- 二十八元/蔵干表は既存候補と同型の数値表を別系統で再確認
- ただし、いずれも公式教材・監修版ではないため一次性の壁は未突破

**追加 sourceId（Iteration 5）**:
- `SRC-AHIKAGA-HAHOU`
- `SRC-OYAMA-28GEN`

### Iteration 6（2026-03-30）

**対象**:
- 一次性の引き上げ（書誌・公式教材情報）

**実施**:
- 高尾学館公式「出版物案内」の取得
- CiNii 書誌（`算命学` 8巻、`原典算命学大系` 11巻）の取得

**結果**:
- `primary-verified` の前提となる**一次資料の所在**を特定:
  - 高尾学館公式で教材体系・巻構成を確認
  - 原典大系の巻別（陰占論/陽占論/位相法領域）を公的書誌で確認
- ただし、公開Web上では**位相法の全組合せ表**や**蔵干日数完全表**の本文断片までは到達不可

**追加 sourceId（Iteration 6）**:
- `SRC-TAKAOGAKKAN-BOOKS-2026`
- `SRC-CINII-SANMEIGAKU-BB1145310X`
- `SRC-CINII-GENTEN-BD14772324`

### Iteration 2（2026-03-30）

**対象**:
- `research-isouhou-pattern-catalog-v1`（実装可能化）

**実施**:
- 位相法の個別ページ（支合・害・刑・破）から組合せ候補を収集
- 既存収集済み（三合会局・対冲）と突合し、`research-v1` 最小セットを確定
- 実装可能判定の必須要素（決定表・優先度・テスト観点）を整備

**結果**:
- `research-isouhou-pattern-catalog-v1` を `ADOPTED-R1` に昇格
- 最小実装セット（R1）を確定:
  - 合法: 支合 / 半会 / 三合会局
  - 散法: 対冲 / 害 / 刑 / 破
- `research-zokan-day-switch-table-v1` は一次数値表不足のため `PENDING-MEDIUM` 維持

### Iteration 3（2026-03-30）

**対象**:
- `research-zokan-day-switch-table-v1`（実装可能化）

**実施**:
- 蔵干日数表の具体値を含む公開記事を探索
- 値が比較的明瞭な枝（申/戌/亥）を抽出
- 全表確定を待たずに段階採用できるよう subset 方針を定義

**結果**:
- `research-zokan-day-switch-table-v1`: `ADOPTED-R1-SUBSET` に昇格
- 先行採用値（R1 subset）:
  - 申: 初元 1-10, 中元 11-13, 本元 14+
  - 戌: 初元 1-9, 中元 10-12, 本元 13+
  - 亥: 13日境界の記述あり（中元有無の解釈は実装時に固定）

**残課題**:
- 全十二支の切替日数表（完全版）を監修一次資料で確定
- 亥の中元有無など表記揺れの解消

---

## 10. 「実装可能」状態の定義

本ワークフローでの「実装可能」は、**対象ルール単位**で次を満たす状態とする。

1. **決定表がある**: if/then で機械判定できる入力・出力が固定されている  
2. **出典が複数ある**: 独立した根拠が2件以上（うち1件は算命学系の基礎解説）  
3. **衝突方針がある**: 同時成立時の優先度または共存方針が定義されている  
4. **テスト観点がある**: 最低3ケース（成立・不成立・競合）を記述済み  
5. **適用境界がある**: Layer3a と Layer3b の責務境界が明記されている  

---

## 11. 実装可能化候補（R1, 要検証）

### 11.1 対象ルール

- `research-isouhou-pattern-catalog-v1` → **候補（PENDING-VERIFICATION）**
- `research-zokan-day-switch-table-v1` → **候補（PENDING-VERIFICATION）**

### 11.2 R1 決定表（草案）

**合法**
- `SHIGO`: `子-丑`, `亥-寅`, `戌-卯`, `酉-辰`, `申-巳`, `未-午`
- `HOSANUI`: `亥-子-丑`, `寅-卯-辰`, `巳-午-未`, `申-酉-戌`
- `HANKAI`: 三合会局の2支成立（同局内ペア）
- `SANGOU`: `申-子-辰`, `亥-卯-未`, `寅-午-戌`, `巳-酉-丑`

**散法**
- `TAICHU`: `子-午`, `丑-未`, `寅-申`, `卯-酉`, `辰-戌`, `巳-亥`
- `GAI`: `子-未`, `丑-午`, `寅-巳`, `卯-辰`, `申-亥`, `酉-戌`
- `KEI`: `子-卯`, `寅-巳`, `巳-申`, `申-寅`, `丑-未`, `未-戌`, `戌-丑`, `辰-辰`, `午-午`, `酉-酉`, `亥-亥`
- `HA`: `子-酉`, `午-卯`, `丑-辰`, `未-戌`

### 11.2.1 検証レベル（Iteration 8 時点）

- `SHIGO`: **V1（独立2系統で一致）**
- `HOSANUI`: **V1-secondary（独立2系統で一致）**
- `TAICHU`: **V1（独立2系統で一致）**
- `GAI`: **V1（独立2系統で一致）**
- `KEI`: **V1（独立2系統で一致）**
- `SANGOU`: **V1-secondary（独立照合あり）**
- `HANKAI`: **V1-secondary（12ペア固定、独立2系統で一致）**
- `HA`: **V1-secondary（独立2系統で一致）**

### 11.3 優先度（R1 草案）

同一ペアで複数判定が成立した場合:

1. `SANGOU`
2. `HANKAI`
3. `HOSANUI`
4. `SHIGO`
5. `TAICHU`
6. `KEI`
7. `GAI`
8. `HA`

注: これは `research` 限定の暫定優先度。主流派には適用しない。

### 11.4 テスト最小セット（R1 草案）

1. **成立**: `申-子-辰` で `SANGOU` が1件返る  
2. **不成立**: 無関係3支で `isouhou=[]`  
3. **競合**: `子-丑-午` で合法と散法が混在した場合に優先度どおり整列  

### 11.5 境界

- Layer3a: 位相法成立判定と `interactionRules.isouhou` 生成まで
- Layer3b: `allowGohouInKaku` を使った格法反映（R1 では未実装）

### 11.6 蔵干日数 R1-subset（草案）

`displayDepth` を 1-origin として扱う。

- `申`:
  - `1..10` → 初元
  - `11..13` → 中元
  - `14..` → 本元
- `戌`:
  - `1..9` → 初元
  - `10..12` → 中元
  - `13..` → 本元
- `亥`:
  - `1..12` → 初元（暫定）
  - `13..` → 本元（暫定）

注:
- `亥` は資料の表記揺れがあるため、`research-v1` では暫定2段運用とし、完全版で再評価する。

### 11.7 現在の結論（正当性ベース）

- 直ちに実装へ進めるのは **V1 領域**（`SHIGO` / `TAICHU` / `GAI` / `KEI`）および **V1-secondary の `HA`**。
- 蔵干完全表・二十八元完全配置は、一次資料不足のため継続リサーチを優先する。

### 11.8 検証ソース区分（運用）

- `primary-verified`: 監修文書・公式教材で確定
- `secondary-verified`: 独立した公開解説2系統で一致（research 限定で使用可）
- `unverified`: 上記いずれも未達

### 11.9 到達上限（公開Web）

現時点で、公開Webのみで到達できる正当性は次の状態:

- 位相法組合せ: **secondary-verified（高）**
- 蔵干/二十八元配置: **secondary-verified（中）**
- 一次資料の所在特定: **primary-source-identified（高）**

一方、**primary-verified（本文確定）** には以下が不足:

1. 高尾学館教材または原典本文の該当ページ断片（版・ページ付き）
2. 監修メモ（sect/rulesetVersion 固定）の取り込み

したがって、公開Web探索のループとしては**収束域**に到達したと判断する。

---

## 12. 出典レベル定義（research運用）

`research` 流派は、各ルールに次の出典レベルを明示する。

| レベル | 定義 | 実装可否（research） | 主流派への昇格 |
|---|---|---|---|
| `L3_UNVERIFIED` | 断片情報のみ。独立照合なし。 | 不可 | 不可 |
| `L2_SECONDARY` | 独立した公開解説2系統以上で一致。 | 可（実験） | 不可 |
| `L1_PRIMARY_IDENTIFIED` | 一次資料の所在（版・巻・書誌）を特定済み。 | 可（実験） | 条件付き |
| `L0_PRIMARY_VERIFIED` | 一次資料本文（版・ページ付き）または監修メモで確定。 | 可（本採用） | 可 |

注:
- `research` での「可」は、`sect: research` 限定。
- `takao` など主流派へ反映するには `L0_PRIMARY_VERIFIED` を必須とする。

### 12.1 既存ステータスとの対応

- `secondary-verified` → `L2_SECONDARY`
- `primary-source-identified` → `L1_PRIMARY_IDENTIFIED`
- `primary-verified` → `L0_PRIMARY_VERIFIED`

---

## 13. 「研究流派の完成」判定

`research-v1` を「完成」とみなす条件:

1. 位相法・蔵干採用ルールに出典レベルが付与済み  
2. `rulesetVersion: research-v1` へ機械可読で反映済み  
3. テストが `sourceLevel` 別に通る（`L2` 実験系 / `L0` 本採用系を分離）  
4. `SECT-RULESET-MATRIX` に `research` 列の出典レベルを明記  
5. 未確定領域（暫定値・保留理由）を docs で説明可能

### 13.1 現在地（2026-03-30）

- 位相法: `L2_SECONDARY`（一部 `L1_PRIMARY_IDENTIFIED`）
- 蔵干/二十八元: `L2_SECONDARY`（`L1_PRIMARY_IDENTIFIED`）
- `L0_PRIMARY_VERIFIED` は未到達（本文断片または監修メモ待ち）

---

## 14. 次フェーズ（完成へ向けた実装準備）

1. `research` ruleset JSON に `sourceLevel` を付与  
2. `sourceLevel < L0` のとき、レスポンス `meta` に研究ルール警告を付与  
3. テストを2系統化（`secondary` / `primary`）  
4. 一次資料入手時に `L2` → `L0` へ昇格できる差分構造を維持

---

## 15. 網羅リサーチ項目（完了まで追跡）

以下を「調査しきるべき情報」の網羅対象とし、各項目に `sourceLevel` を付与する。

| 領域 | 必須情報 | 完了条件 |
|---|---|---|
| 1) 位相法タクソノミ | 合法/散法の採用集合（支合・半会・三合・方三位・対冲・害・刑・破 ほか） | `ruleset` に `kind` 一覧 + sourceLevel 記載 |
| 2) 位相法組合せ表 | 各 `kind` の成立ペア/トリプル一覧 | すべての `kind` で if/then 化 |
| 3) 位相法競合規則 | 同時成立時の優先度・共存/抑制規則 | resolver 仕様とテスト3ケース以上 |
| 4) 蔵干スロット | 各支の初元/中元/本元（または2段）定義 | 全12支を `zokanRules` に固定 |
| 5) 蔵干日数閾値 | 節入りから何日目で切替か（displayDepth基準） | 全12支の閾値が版付きで確定 |
| 6) 二十八元配置 | 二十八元を採る場合の支-干対応と切替規則 | 参照表 + 境界例をテスト化 |
| 7) 虚気発火条件 | 干合成立条件、月支条件、隣接/非隣接、除外条件 | `kyokiRules` と成立/不成立テスト |
| 8) 格法接続境界 | `allowGohouInKaku` が有効になる範囲 | Layer3a/3b 契約に反映 |
| 9) 大運連携 | 位相法/虚気が大運・年運にどう乗るか | dynamicTimeline 連携仕様 |
| 10) エラー契約 | 根拠不足時の扱い（警告/拒否） | `meta` 警告とテスト |
| 11) 語彙ガード | 四柱推命語の混入防止ルール | docs・schema・ID の語彙統一 |
| 12) 出典メタ | `sourceId`, `sourceLevel`, `sourceRevision` | すべての research ルールに付与 |

### 15.1 優先度（実装前提）

- **P0**: 1/2/3/4/5/12（ここが揃えば `research-v1` 実装に着手可能）
- **P1**: 7/8/10/11（実装品質と安全運用）
- **P2**: 6/9（拡張領域）

### 15.2 除外ポリシー（混線防止）

- 四柱推命・子平法を主軸にした解説ページは、算命学 `research` ルールの根拠に使わない
- 算命学語彙に見えても、十神体系を前提にした説明は除外する
- 中国語圏の一般命理サイトは補助参照まで（`sourceLevel` 判定には使わない）

---

## 16. Iteration 7（キックオフ）

**実施**:
- `kyoki` 条件、`方三位`、`半会/三合`、`allowGohouInKaku` を探索

**結果**:
- `方三位` と `半会/三合` は公開解説の独立ソース候補を追加（L2強化余地あり）
- `kyoki` は四柱推命/八字混線が強く、今回取得分は採用見送り
- `allowGohouInKaku` は算命学一次に近い記述が薄く、継続課題

**運用判断**:
- `kyoki` と `allowGohouInKaku` は **L3_UNVERIFIED** のまま固定
- 次ループは P0 の残（蔵干全12支の版付き閾値、位相法の方三位/半会の固定表）を優先

### Iteration 8（2026-03-30）

**対象**:
- 位相法の `方三位` / `半会` 固定表

**実施**:
- `算命学Stock` と `自然法算命学` の独立2系統で照合
- 組合せ表を if/then で実装可能な形に整形

**結果**:
- `HOSANUI`（方三位）4組を固定:
  - `亥-子-丑`, `寅-卯-辰`, `巳-午-未`, `申-酉-戌`
- `HANKAI`（半会）12組を固定:
  - 水: `申-子`, `子-辰`, `申-辰`
  - 木: `亥-卯`, `卯-未`, `亥-未`
  - 火: `寅-午`, `午-戌`, `寅-戌`
  - 金: `巳-酉`, `酉-丑`, `巳-丑`
- いずれも `secondary-verified`（L2）として採用

**追加 sourceId（Iteration 8）**:
- `SRC-SANMEI-STOCK-HOSANUI`
- `SRC-SANMEI-STOCK-HANKAI`
- `SRC-SHIZENHOU-HOSANUI`
- `SRC-SHIZENHOU-HANKAI-SANGOU`

### Iteration 9（2026-03-30）

**対象**:
- 蔵干全12支閾値の固定（P0）
- データソースの混線除去

**実施**:
- 蔵干/二十八元系の候補を再探索
- 算命学文脈ソースと四柱推命寄りソースを分離
- 採用/除外ルールを明文化

**結果**:
- `方三位` / `半会` の固定表は維持（Iteration 8 の採用は妥当）
- 蔵干系は、以下を暫定採用候補として維持:
  - `SRC-SANMEIGAKU-ACADEMY-ZOKAN-2017`
  - `SRC-OYAMA-28GEN`
- 以下は四柱推命寄り・語彙混線が強いため**除外**:
  - `てくてくちとせ` など四柱推命主体サイト
  - 八字/命理一般サイト（中華圏の地支蔵干表）

**運用ルール（Iteration 9 で追加）**:
1. `research` 採用候補は「算命学」を明示するソースのみ対象  
2. 四柱推命語彙（十神中心、子平法主体）のみで構成されたページは除外  
3. 数値表は最低2ソースで一致し、かつ1ソースは算命学文脈を要件化  

**追加 sourceId（Iteration 9）**:
- `SRC-SANMEI-STOCK-HOSANUI`（再確認）
- `SRC-SANMEI-STOCK-HANKAI`（再確認）
- `SRC-SHIZENHOU-HOSANUI`（再確認）
- `SRC-SHIZENHOU-HANKAI-SANGOU`（再確認）

### Iteration 10（2026-03-30）

**対象**:
- 蔵干全12支閾値（P0 残）

**実施**:
- 算命学文脈に限定して再突合（`SRC-SANMEIGAKU-ACADEMY-ZOKAN-2017` と `SRC-OYAMA-28GEN`）
- 追加探索は実行したが、四柱推命/八字寄りを除外

**結果**:
- 全12支の閾値候補は2ソースで概ね同型
- ただし表記崩れ・記法差があり、機械可読化時に正規化ルールが必要
- 新規に `L2` を引き上げる有効ソースは獲得できず（ノイズ優位）

**運用判断**:
- 蔵干全12支閾値は `L2_SECONDARY` のまま据え置き
- `L0` 昇格は一次本文または監修メモ待ち
- 次ループは「正規化仕様策定」（記法差を吸収する変換規則）を優先

### 16.1 蔵干閾値の正規化方針（draft）

1. 日数表記を `1-origin` に統一（`displayDepth` 基準）
2. `~9`, `10~12`, `13~` のような記法を `[1,9]`, `[10,12]`, `[13,INF]` に正規化
3. 2段構成（中元なし）の支は `middle=null` と明示
4. 出典ごとの差分は `sourceRevision` に記録し、値は ruleset 側で単一化


