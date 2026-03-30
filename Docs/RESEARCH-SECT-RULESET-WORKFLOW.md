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
- Layer3b: `allowGohouInKaku` を使った格法反映（R1 最小実装済み。`kaku.candidates/resolved/suppressed`）

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

---

## 17. 大運本算法リサーチ・スプリント（実行版）

本節は `Docs/PHASE2-RULESET-AND-DAIUN.md` の「本番実装前に仕様を詰める」方針を、`research` 運用に落とした実行手順である。

### 17.1 目的

- 大運本算法の未確定点（起算・順逆行・端数・例外）を、`ruleId` 単位で追跡可能にする。
- 公開Web探索の追加ではなく、監修質問票と一次資料 locator 収集へ重心を移す。
- `L2` 実験値と `L0` 確定値を混線させず、`takao-v1` 実装へ橋渡しする。

### 17.2 対象 `ruleId`

- `research-daiun-start-rule-v1`
- `research-daiun-direction-rule-v1`
- `research-daiun-rounding-rule-v1`
- `research-daiun-boundary-exception-v1`

### 17.3 質問票テンプレート（監修向け）

```md
### ruleId: research-daiun-start-rule-v1
- question: 大運の起算点は何を基準に取るか
- choices: [節入り差分基準, 別基準]
- requiredInput: birthDate, birthTime?, context.timeZone
- expectedDecision: if/then で記述
- evidenceLocator: 版・巻・ページ
- sourceLevelTarget: L0_PRIMARY_VERIFIED

### ruleId: research-daiun-direction-rule-v1
- question: 順逆行の判定軸（性別、陰陽、その他）
- choices: [A案, B案, 監修定義]
- requiredInput: gender, dayStem, yearStem?
- expectedDecision: if/then で記述
- evidenceLocator: 版・巻・ページ
- sourceLevelTarget: L0_PRIMARY_VERIFIED

### ruleId: research-daiun-rounding-rule-v1
- question: 起算年齢の端数処理（切上げ/切捨て/四捨五入）
- choices: [ceil, floor, round, 監修定義]
- requiredInput: dayDiff, divisor
- expectedDecision: 計算式で記述
- evidenceLocator: 版・巻・ページ
- sourceLevelTarget: L0_PRIMARY_VERIFIED

### ruleId: research-daiun-boundary-exception-v1
- question: 境界時刻・同日節入り・birthTime欠損時の扱い
- choices: [例外A, 例外B, 監修定義]
- requiredInput: birthDate, birthTime?, solarTerms, context.timeZone
- expectedDecision: error/warning/continue の分岐
- evidenceLocator: 版・巻・ページ
- sourceLevelTarget: L0_PRIMARY_VERIFIED
```

### 17.4 ゴールデンケース雛形（research）

- 最低 5 ケースを固定する（通常、境界、逆行、端数、例外）。
- ケースごとに `sourceLevel` と `sourceId` を持たせる。
- 期待値は以下を最低限含める:
  - `dynamicTimeline.daiun.startAge`
  - `dynamicTimeline.daiun.direction`
  - `dynamicTimeline.daiun.phases[0]`
  - `meta.warnings[]`

### 17.5 完了条件（このスプリント）

1. 4つの `ruleId` すべてに質問票が埋まっている  
2. 5ケース以上のゴールデン雛形が作成済み  
3. 各ルールに `sourceLevel` と `sourceRevision` の初期値がある  
4. `L2` と `L0` の昇格条件がケース単位で追跡可能  

### 17.6 実行順（1サイクル）

1. 質問票を更新（未回答欄を明示）  
2. 取得済み出典に locator を付与  
3. ケース期待を `secondary` と `primary` に分離  
4. `status` を `PENDING-*` / `ADOPTED-*` で再判定  
5. 差分を `RESEARCH-SECT-SPEC.md` に同期  

### 17.7 Iteration 11（2026-03-31 / 大運キックオフ）

**対象**:
- `research-daiun-start-rule-v1`
- `research-daiun-direction-rule-v1`
- `research-daiun-rounding-rule-v1`
- `research-daiun-boundary-exception-v1`

**実施**:
- 算命学文脈での公開情報探索（大運起算・順逆行・端数・境界）
- 既採用系ソース（算命学Stock）の本文抽出
- 一次資料導線（高尾学館出版物案内・CiNii書誌）の再確認
- 四柱推命/八字系ノイズの除外判定

**追加 sourceId（Iteration 11）**:
- `SRC-SANMEI-STOCK-CALC-METHOD`  
  - URL: `https://sanmei-stock.com/output-propositions/calculation-method/`
  - 用途: 大運の順逆判定、`3`除算、丸め規則（高尾式/朱学院式比較）
- `SRC-SANMEI-STOCK-FORMULAS-MISMATCH`  
  - URL: `https://sanmei-stock.com/prior-knowledge/formulas-do-not-match/`
  - 用途: 流派差（節入り日カウント差、丸め差）の説明
- `SRC-TAKAOGAKKAN-BOOKS-2026`（再確認）
- `SRC-CINII-GENTEN-BD14772324`（再確認）

**ルール別の暫定判定（Iteration 11 時点）**:
- `research-daiun-start-rule-v1`: `PENDING-MEDIUM`
  - 根拠: 2次情報で「順回り=次節入日数/逆回り=前節入日数」の記述を確認
  - 不足: 独立2系統の算命学ソース、または監修一次本文
- `research-daiun-direction-rule-v1`: `PENDING-LOW`
  - 根拠: 本文内に順逆の分岐説明はあるが、学派固定の一次裏付けが不足
  - 不足: 高尾学館教材・原典本文での判定軸確定
- `research-daiun-rounding-rule-v1`: `PENDING-MEDIUM`
  - 根拠: 「高尾式=四捨五入」「朱学院式=切り上げ」の比較記述を確認
  - 不足: 監修一次資料での丸め規則の固定
- `research-daiun-boundary-exception-v1`: `PENDING-MEDIUM`
  - 根拠: 節入り当日を含む/含まない差が実例付きで記述
  - 不足: 本番採用時の例外優先順位（warning/error/continue）の監修決定

**除外（混線防止）**:
- 中国語圏の八字/命理サイト群（順逆行・起運説明）は `research` 根拠から除外
- 四柱推命主体で算命学語彙が薄いページは `sourceLevel` 判定に使わない

**今回の成果（実行可能化）**:
1. 大運4ルールの `ruleId` ごとに初期 `status` を付与  
2. 実装に使える候補式（順逆・3除算・丸め）を if/then 化可能な粒度で抽出  
3. 一次資料導線（高尾学館出版物・原典書誌）を再固定  

**次ループ（Iteration 12）でやること**:
1. 監修質問票へ「A/B選択肢」ではなく「最終採用値」欄を追加  
2. 5ケースの大運ゴールデン雛形を `secondary` と `primary` に分離して起票  
3. `research-daiun-direction-rule-v1` を優先して独立2系統の算命学ソースを追加探索  
4. `L0` 昇格条件（版・巻・ページ）のチェック項目をケース単位に紐づけ  

### 17.8 Iteration 12（2026-03-31 / 質問票の確定欄追加）

**実施**:
- `17.3` の質問票を「選択肢」中心から「最終採用値」記録型へ拡張
- `ruleId` ごとに `finalDecision` / `decisionStatus` / `adoptedBy` を追加
- `L0` 到達時にそのまま ruleset へ移植できる形式に整形

**質問票フィールド（追加）**:
- `finalDecision`: 実装で使う最終値（if/then 文字列可）
- `decisionStatus`: `UNSET` / `PROVISIONAL` / `CONFIRMED`
- `adoptedBy`: `research-only` / `mainstream`
- `appliesFrom`: `rulesetVersion`（例: `research-v1.1`）

**運用判断**:
- `decisionStatus=PROVISIONAL` でも `research-only` なら実装候補として扱う
- `mainstream` へ昇格するには `CONFIRMED` + `L0_PRIMARY_VERIFIED` を必須

### 17.9 Iteration 13（2026-03-31 / 大運ゴールデン雛形5件）

**実施**:
- 大運ルール検証用ケースを `secondary` / `primary` に分離起票
- まず `secondary` に 5 ケースを固定し、`primary` は空スロットのみ確保

**secondary ケース雛形（5件）**:
1. `DAIUN-S-001-normal-forward`  
   - 目的: 陽年干×男性（順回り）で startAge と phase 遷移を確認
2. `DAIUN-S-002-normal-backward`  
   - 目的: 陰年干×男性（逆回り）で前節入基準を確認
3. `DAIUN-S-003-rounding-half-up`  
   - 目的: `3`除算の四捨五入（高尾式想定）を確認
4. `DAIUN-S-004-boundary-same-day`  
   - 目的: 節入り当日のカウント差（含む/含まない）を警告付きで確認
5. `DAIUN-S-005-clamp-zero-eleven`  
   - 目的: 0歳運→1歳運、11歳運→10歳運の補正を確認

**primary スロット（予約）**:
- `DAIUN-P-001` 〜 `DAIUN-P-005`（監修確定後にのみ期待値を投入）

### 17.10 Iteration 14（2026-03-31 / 実装可能判定）

**判定対象**:
- `research-daiun-start-rule-v1`
- `research-daiun-direction-rule-v1`
- `research-daiun-rounding-rule-v1`
- `research-daiun-boundary-exception-v1`

**判定結果（research 限定）**:
- `research-daiun-start-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-direction-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-rounding-rule-v1`: `ADOPTED-R1-SECONDARY`
- `research-daiun-boundary-exception-v1`: `ADOPTED-R1-SECONDARY`

**採用した暫定決定表（R1）**:
- 順逆行:
  - 年干が陽: 男性=順回り, 女性=逆回り
  - 年干が陰: 男性=逆回り, 女性=順回り
- 起算:
  - 順回り: `nextTermDayDiff / 3` を使用
  - 逆回り: `prevTermDayDiff / 3` を使用
- 丸め:
  - R1 は四捨五入（高尾式想定）を採用
  - 派生流派差（切り上げ）は分岐オプションとして保持
- 補正:
  - 算出 0 は 1歳運へ補正
  - 算出 11 は 10歳運へ補正

**制約（重要）**:
- 上記は `research-v1` の実験実装に限る
- `sourceLevel` は `L2_SECONDARY` のまま据え置き
- `takao` 系への反映は禁止（`L0` 到達後のみ）

**実装可能化の結論**:
- `research` に限り、大運本算法の最小実装（R1）に着手可能
- 本採用へ必要な残課題は「一次本文または監修メモでの丸め・境界優先順位確定」

### 17.11 Iteration 15（2026-03-31 / R1 実装反映）

**実施**:
- `research-v1` 用の `researchDaiun` 契約を ruleset schema に追加
- `bundledRulesets` の `research-v1` 合成に `researchDaiun` を注入
- `resolveDynamicTimeline` に research 分岐を実装
  - 順逆判定（年干陰陽 × 性別）
  - 起算日数（順=次節入、逆=前節入）をローカル暦日 JDN 差で算出
  - `3`除算の四捨五入 + `0->1` / `11->10` 補正
  - 月柱干支 index を起点に `forward:+1` / `backward:-1` で初旬を決定
- `DaiunTimelineSchema` に `direction` / `startDayDiff` を追加
- `debugTrace` に `startDayDiff` / `roundedStartAge` を追加

**テスト結果**:
- `npm test -w @sanmei/sanmei-core` ✅
- `npm run build -w @sanmei/sanmei-core` ✅

**反映結果**:
- `research-v1` は R1 大運本算法で計算される
- `mock-v1` / `mock-internal-v2` は既存 `timelineMock` 挙動を維持

### 17.12 Iteration 16（2026-03-31 / secondary 5ケースをテスト固定）

**実施**:
- `calculate.test.ts` に `DAIUN-S-001` 〜 `DAIUN-S-005` を追加
- 各ケースは「完全ゴールデン一致」ではなく、R1で崩れてはいけない判定軸を固定:
  - S-001: 順回り判定
  - S-002: 逆回り判定 + backward 境界遷移
  - S-003: 端数処理反映（trace の `roundedStartAge`）
  - S-004: 節入り境界日で `startDayDiff >= 0`
  - S-005: `startAge` が `1..10` クランプ

**テスト結果**:
- `npm test -w @sanmei/sanmei-core` ✅（50 tests）
- `npm run build -w @sanmei/sanmei-core` ✅

**運用判断**:
- `secondary` は回帰検知を優先し、監修確定前の過剰固定は避ける
- `primary` は引き続き監修確定後にケース化する

### 17.13 Iteration 17（2026-03-31 / primary 予約スロットをテスト化）

**実施**:
- `calculate.test.ts` に `DAIUN-P-001` 〜 `DAIUN-P-005` を `it.todo` で追加
- 監修値未確定の現段階で、実行可能テストへは昇格させず「差し込み口」を固定

**追加した予約スロット**:
1. `DAIUN-P-001-start-rule-l0`
2. `DAIUN-P-002-direction-rule-l0`
3. `DAIUN-P-003-rounding-rule-l0`
4. `DAIUN-P-004-boundary-rule-l0`
5. `DAIUN-P-005-end-to-end-l0`

**運用判断**:
- `primary` は `L0_PRIMARY_VERIFIED` 到達後に `todo` を通常テストへ昇格する
- 昇格時は `sourceId` / `locator`（版・巻・ページ）を各ケースに紐づける

---

## 18. 高次補正・詳細位相法リサーチループ（実行版）

### 18.1 Iteration 18（2026-03-31 / P0キックオフ）

**対象**:
- 位相法の拡張集合（既存8種の外側）
- 位相法の適用スコープ（命式内のみか、動態連携まで含むか）
- `kyoki` / `allowGohouInKaku` の再探索可否判定

**実施**:
- 高尾系導線を優先して公開情報を再探索
- 既存採用ソース（`sanmei-stock` / `自然法算命学`）の位相法カテゴリを再抽出
- 一次導線として書誌情報を再取得（古書導線）
- 四柱推命・八字の混線ソースを除外

**追加 sourceId（Iteration 18）**:
- `SRC-SANMEI-STOCK-TOPOLOGY-INDEX-2026`
  - URL: `https://sanmei-stock.com/category/basic/yin/topology/`
  - 用途: 位相法の拡張カテゴリ候補（方三位・大半会・律音・納音・天剋地冲）の抽出
- `SRC-SHIZENHOU-ISOUHOU-OVERVIEW-2026`
  - URL: `https://xn--ltrs4nlq4a.jp/%E7%AE%97%E5%91%BD%E5%AD%A6%E3%82%92%E5%AD%A6%E3%81%B6/%E7%AE%97%E5%91%BD%E5%AD%A6%E7%84%A1%E6%96%99%E8%AC%9B%E5%BA%A7/%E5%91%BD%E5%BC%8F%E3%81%AE%E8%A6%8B%E6%96%B9/%E9%99%B0%E5%8D%A0/%E4%BD%8D%E7%9B%B8%E6%B3%95`
  - 用途: 位相法上位カテゴリ（合法/散法の文脈）と関連項目の再確認
- `SRC-KOSHO-SANMEIGAKU5-TAKAO-ENTRY-2026`
  - URL: `https://www.kosho.or.jp/products/detail.php?product_id=490683627`
  - 用途: `算命学（5）大運と位相法` の書誌導線補強（`L1_PRIMARY_IDENTIFIED` 補助）

**ルール候補（初期）**:
- `research-isouhou-extended-taxonomy-v1`
  - statement: 位相法の拡張候補（`KANGO`, `NACHION`, `RITSUON`, `TENKOKUCHICHU`, `DAIHANKAI`）を `research` 専用の候補集合として保持する
  - status: `PENDING-MEDIUM`
  - sourceLevel: `L2_SECONDARY` 相当（公開解説ベース）
  - notes: `research-v1` 契約（既存8種）へ直投入はせず、`research-v1.1` 以降の feature gate 候補として分離
- `research-isouhou-scope-boundary-v1`
  - statement: 位相法の適用範囲を「命式内判定」「命式×大運」「命式×年運」の3層に分離し、レイヤ責務（L3a/L3b）を固定する
  - status: `PENDING-HIGH`
  - sourceLevel: `L2_SECONDARY`（実装要件起点）
  - notes: 既存 `dynamicTimeline` 連携と競合しないよう、resolver 入力契約を先に固定する
- `research-kyoki-trigger-guard-v2`
  - statement: `kyoki` は算命学一次または監修メモの条件確定まで新規トリガ追加を禁止し、shadow返却契約のみ維持する
  - status: `PENDING-HIGH`
  - sourceLevel: `L3_UNVERIFIED`（条件本体）
  - notes: 八字・四柱推命由来の干合条件を混入させない安全弁ルール
- `research-allowgohou-kaku-boundary-v2`
  - statement: `allowGohouInKaku` の作用対象を `GOHOU` タグ候補 suppress 判定のみに限定し、位相法拡張集合とは直結させない
  - status: `PENDING-HIGH`
  - sourceLevel: `L2_SECONDARY`（現行仕様準拠）
  - notes: 格法への取り込みは `L0` 根拠獲得後に段階開放

**判定**:
- 位相法の「拡張候補の存在」は `L2` で収集可能。
- ただし個別真理値（成立表・優先度・抑制条件）の固定は `L0` 不足のため未到達。
- `kyoki` 条件と `allowGohouInKaku` 拡張は、今回も `L0` 導線不足により採用保留。

**次ループ（Iteration 19）**:
1. `research-isouhou-extended-taxonomy-v1` の各 `kind` について、最低2系統の算命学ソース一致を確認
2. `research-isouhou-scope-boundary-v1` を resolver 契約（入力/出力/優先度）に落とす
3. 高尾系一次資料の locator（巻・章・頁）を質問票形式で穴埋めする

### 18.2 Iteration 19（2026-03-31 / 拡張 kind の2系統照合）

**対象**:
- `research-isouhou-extended-taxonomy-v1`（`KANGO`, `NACHION`, `RITSUON`, `TENKOKUCHICHU`, `DAIHANKAI`）
- `research-isouhou-scope-boundary-v1` の if/then 化

**実施**:
- `sanmei-stock` の拡張位相法個別ページを取得し、各 `kind` の成立条件を抽出
- `自然法算命学` の位相法一覧で同カテゴリの存在を照合
- 四柱推命/八字中心ページを除外したまま、算命学文脈で一致確認

**追加 sourceId（Iteration 19）**:
- `SRC-SANMEI-STOCK-KANGO-2026`
  - URL: `https://sanmei-stock.com/applied/resonance/`
  - 用途: `KANGO` の成立ペア（甲己/乙庚/丙辛/丁壬/戊癸）と作用記述
- `SRC-SANMEI-STOCK-NACHION-2026`
  - URL: `https://sanmei-stock.com/basic/yin/topology/equals-and-conflicts/`
  - 用途: `NACHION`（同一天干 + 地支対冲）の条件記述
- `SRC-SANMEI-STOCK-RITSUON-2026`
  - URL: `https://sanmei-stock.com/basic/yin/topology/strong-equal-sign/`
  - 用途: `RITSUON`（同干支一致）の条件記述
- `SRC-SANMEI-STOCK-TENKOKUCHICHU-2026`
  - URL: `https://sanmei-stock.com/basic/yin/topology/attacks-and-opposition/`
  - 用途: `TENKOKUCHICHU`（天干同陰陽相剋 + 地支対冲）の条件記述
- `SRC-SANMEI-STOCK-DAIHANKAI-2026`
  - URL: `https://sanmei-stock.com/basic/yin/topology/inter-dimensional_fusion/`
  - 用途: `DAIHANKAI`（同一天干 + 地支半会）の条件記述

**照合結果（カテゴリ存在）**:
- `自然法算命学` 位相法一覧に、`干合` / `納音` / `律音` / `大半会` / `天剋地冲` のカテゴリが列挙されることを確認
- `sanmei-stock` 側で各カテゴリの個別定義ページを取得
- 以上により、**カテゴリ存在レベル**では独立2系統一致を確認

**ルール判定更新**:
- `research-isouhou-extended-taxonomy-v1`
  - status: `ADOPTED-R1-SECONDARY`
  - sourceLevel: `L2_SECONDARY`
  - 採用範囲: `kind` のカタログ登録まで（真理値固定は除く）
  - 制約: `research-v1` の既存8種ロジックを置換しない。`research-v1.1` 以降の feature gate 前提。
- `research-isouhou-scope-boundary-v1`
  - status: `PENDING-HIGH`
  - sourceLevel: `L2_SECONDARY`
  - if/then 草案:
    - if `scope = natalOnly` then L3a は命式内ペア/トリプルのみ評価
    - if `scope = natalXTimeline` then L3a は命式×大運/年運のクロス判定を追加
    - if L3b 格法評価 then `allowGohouInKaku` は `GOHOU` suppress 判定のみ適用
  - 不足: 高尾系一次資料での scope 正当化（巻・章・頁）

**運用判断**:
- 拡張 `kind` は「存在カタログ」としては `L2` 採用可能。
- ただし成立表・優先度・抑制条件（resolver 真理値）は未確定のため、`PENDING` のまま別レーン管理する。
- `kyoki` 条件本体は引き続き `L3_UNVERIFIED` を維持。

**次ループ（Iteration 20）**:
1. 拡張 `kind` ごとに「成立条件の最小 if/then」と「除外条件」を分離記述
2. `research-isouhou-scope-boundary-v1` を `SECT-RULESET-MATRIX` の行定義に同期
3. 高尾系一次資料 locator の質問票（巻・章・頁）を `OPEN-QUESTIONS` 連動で作成

### 18.3 Iteration 20（2026-03-31 / 最小 if/then と locator 質問票）

**対象**:
- `research-isouhou-extended-taxonomy-v1` の最小判定式
- `research-isouhou-scope-boundary-v1` の適用境界
- 高尾系 `L0` 取得に向けた locator 質問票

**最小 if/then（draft, L2）**:

1) `KANGO`
- if `pair(stemA, stemB)` in `{甲己,乙庚,丙辛,丁壬,戊癸}` then `kind=KANGO`
- else not成立
- 除外条件:
  - `sect != research` では適用しない
  - `rulesetVersion=research-v1` では feature gate が `false` なら評価しない

2) `NACHION`
- if `stemA == stemB` and `branchPair` is opposition (`TAICHU`) then `kind=NACHION`
- else not成立
- 除外条件:
  - 対冲判定が未成立なら不成立
  - 命式内3柱以外の比較は `scope` 許可時のみ

3) `RITSUON`
- if `stemA == stemB` and `branchA == branchB` then `kind=RITSUON`
- else not成立
- 除外条件:
  - 同一干支の重複検知は「柱組み合わせ1回のみ」カウント

4) `TENKOKUCHICHU`
- if `stemPair` is same-polarity overcoming and `branchPair` is opposition (`TAICHU`) then `kind=TENKOKUCHICHU`
- else not成立
- 除外条件:
  - `stemPair` の相剋判定が ruleset 未定義なら評価保留

5) `DAIHANKAI`
- if `stemA == stemB` and `branchPair` in `HANKAI` then `kind=DAIHANKAI`
- else not成立
- 除外条件:
  - `HANKAI` 判定が未成立なら不成立

**scope 境界（resolver 草案）**:
- `natalOnly`: 命式内（年/月/日）組み合わせのみ評価
- `natalXTimeline`: 命式×大運/年運を追加評価
- `timelineOnly`: 現時点では未採用（誤検知リスク高）

**locator 質問票（高尾系一次, draft）**:
```md
### ruleId: research-isouhou-extended-taxonomy-v1
- sourceTarget: 原典算命学大系 or 高尾学館教材
- kind: KANGO / NACHION / RITSUON / TENKOKUCHICHU / DAIHANKAI
- volume:
- chapter:
- pageStart:
- pageEnd:
- quotation:
- decisionStatus: UNSET
- sourceLevelTarget: L0_PRIMARY_VERIFIED
```

**運用判断**:
- 拡張5種は「最小 if/then」の形に落とし込めたため、実装前レビュー可能な状態へ前進。
- ただし `stemPair` の厳密相剋判定テーブルと、timeline 連携時の重複解消規則は未確定。

**次ループ（Iteration 21）**:
1. 拡張5種の競合解消ルール（同時成立時の suppress/priority）を定義
2. `OPEN-QUESTIONS` に locator 質問票運用の明文化を追加
3. 高尾系一次導線で巻・章・頁の実値回収を開始

### 18.4 Iteration 21（2026-03-31 / 競合解消ルールの草案化）

**対象**:
- 拡張5種（`KANGO`, `NACHION`, `RITSUON`, `TENKOKUCHICHU`, `DAIHANKAI`）の同時成立処理
- 既存8種との優先関係

**競合解消ルール（draft）**:

1) 基本方針
- `research-v1` 既存8種（基本位相法）を主系列とし、拡張5種は副系列として扱う
- 同一ペア/同一トリプルで基本位相法と拡張位相法が同時成立した場合、**基本位相法を優先**

2) 拡張5種内の暫定優先度
1. `TENKOKUCHICHU`
2. `DAIHANKAI`
3. `RITSUON`
4. `NACHION`
5. `KANGO`

3) suppress 条件（最小）
- if `RITSUON` and `NACHION` are同時成立 then keep `RITSUON`, suppress `NACHION`
- if `TENKOKUCHICHU` and (`NACHION` or `KANGO`) are同時成立 then keep `TENKOKUCHICHU`, suppress others
- if `DAIHANKAI` and `KANGO` are同時成立 then keep both（系列が異なるため共存）

4) 出力契約
- `interactionRules.isouhouExtended.candidates[]` に全候補を保持
- `interactionRules.isouhouExtended.resolved[]` に採用結果を保持
- `interactionRules.isouhouExtended.suppressed[]` に抑制理由を保持

**状態更新**:
- `research-isouhou-extended-conflict-priority-v1` を新規候補として登録
  - status: `PENDING-HIGH`
  - sourceLevel: `L2_SECONDARY`
  - notes: 現段階は resolver 安定化目的の暫定規則。`L0` で再評価必須。

**次ループ（Iteration 22）**:
1. 高尾系一次資料 locator 実値（巻・章・頁）の回収ログを起票
2. `research-isouhou-extended-conflict-priority-v1` の監修質問票を追加
3. `SECT-RULESET-MATRIX` の備考へ競合規則の暫定リンクを追記

### 18.5 Iteration 22（2026-03-31 / locator 回収ログ起票）

**対象**:
- 高尾系一次導線の `locator` 実値回収
- 監修質問票の運用開始

**実施**:
- 公開Webから高尾学館の出版導線を再確認
- `算命学（5）大運と位相法` の書誌導線を再確認
- 拡張5種に対して `locator` 回収ログを起票

**locator 回収ログ（初期）**:

| kind | sourceTarget | volume | chapter | pageStart-pageEnd | 状態 | 備考 |
|---|---|---|---|---|---|---|
| `KANGO` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | 公開Webで本文断片未到達 |
| `NACHION` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | カテゴリ存在のみ確認済み |
| `RITSUON` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | カテゴリ存在のみ確認済み |
| `TENKOKUCHICHU` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | カテゴリ存在のみ確認済み |
| `DAIHANKAI` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | カテゴリ存在のみ確認済み |

**監修質問票（運用テンプレート）**:
```md
### ruleId: research-isouhou-extended-taxonomy-v1
- kind:
- sourceTarget: 高尾学館教材 / 原典算命学大系
- volume:
- chapter:
- pageStart:
- pageEnd:
- quotation:
- ifThenConfirmed:
- exceptionRule:
- decisionStatus: UNSET
- adoptedBy: research-only
- sourceLevelTarget: L0_PRIMARY_VERIFIED
```

**運用判断**:
- `L2` の実装前提（カテゴリ・最小 if/then・競合草案）は維持。
- `L0` 昇格レーンは、`PENDING-LOCATOR` を解消しない限り進めない。

**次ループ（Iteration 23）**:
1. `PENDING-LOCATOR` の進捗管理カラム（owner/due/lastChecked）を追加
2. 監修質問票に `priority`（P0/P1）を追加
3. `OPEN-QUESTIONS` に回収ログ運用ルールを同期

### 18.6 Iteration 23（2026-03-31 / locator 進捗メタ運用）

**対象**:
- `PENDING-LOCATOR` 管理の運用強化
- 監修質問票の優先度運用

**実施**:
- locator 回収ログに `owner/due/lastChecked` カラムを追加
- 監修質問票に `priority`（`P0` / `P1`）を追加
- `P0` を「実装進行を止める依存論点」、`P1` を「拡張改善論点」と定義

**locator 回収ログ（更新）**:

| kind | priority | sourceTarget | volume | chapter | pageStart-pageEnd | 状態 | owner | due | lastChecked | 備考 |
|---|---|---|---|---|---|---|---|---|---|---|
| `KANGO` | `P1` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | `research-team` | `2026-04-15` | `2026-03-31` | 虚気接続は本体未確定のため当面P1 |
| `NACHION` | `P1` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | `research-team` | `2026-04-15` | `2026-03-31` | カテゴリ存在のみ確認済み |
| `RITSUON` | `P1` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | `research-team` | `2026-04-15` | `2026-03-31` | カテゴリ存在のみ確認済み |
| `TENKOKUCHICHU` | `P0` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | `research-team` | `2026-04-15` | `2026-03-31` | 大運連携説明が厚いためL0先行 |
| `DAIHANKAI` | `P0` | 高尾学館教材 / 原典算命学大系 | 未取得 | 未取得 | 未取得 | `PENDING-LOCATOR` | `research-team` | `2026-04-15` | `2026-03-31` | 半会依存かつ拡張中核のためL0先行 |

**監修質問票（更新テンプレート）**:
```md
### ruleId: research-isouhou-extended-taxonomy-v1
- priority: P0 or P1（下表の kind ごとにセット）
- kind:
- sourceTarget: 高尾学館教材 / 原典算命学大系
- volume:
- chapter:
- pageStart:
- pageEnd:
- quotation:
- ifThenConfirmed:
- exceptionRule:
- decisionStatus: UNSET
- adoptedBy: research-only
- sourceLevelTarget: L0_PRIMARY_VERIFIED
```

**運用ルール（追記）**:
- `priority=P0`: 未解決だと `research-v1.1` 実装着手を停止する論点
- `priority=P1`: 実装後改善として並行追跡する論点
- `lastChecked` が 14 日以上更新されない `P0` は再探索を自動起票する

**次ループ（Iteration 24）**:
1. `SECT-RULESET-MATRIX` に `P0/P1` 優先度メモを追加
2. 拡張5種の `priority` 初期値を定義（`TENKOKUCHICHU/DAIHANKAI` を P0 想定）
3. `OPEN-QUESTIONS` に 14 日ルールを同期

### 18.7 Iteration 24（2026-03-31 / locator priority 初期値確定）

**対象**:
- 拡張5種の `priority` 初期割当
- `SECT-RULESET-MATRIX` / `OPEN-QUESTIONS` との同期

**実施**:
- locator 回収ログに `priority` 列を追加
- `P0` を **2種に限定**（過剰ブロックを避ける）
- 監修質問票テンプレの `priority` を kind 毎可変に修正

**初期割当（確定）**:
- `P0`: `TENKOKUCHICHU`, `DAIHANKAI`
- `P1`: `KANGO`, `NACHION`, `RITSUON`

**採用理由（弊害回避）**:
- `TENKOKUCHICHU` は大運・年運クロスと結びつく説明が厚く、`scope` 確定前に実装すると resolver 契約が不安定になりやすい
- `DAIHANKAI` は `HANKAI` 依存の拡張中核で、半会テーブル改定の波及が大きい
- `KANGO` は `kyoki` 接続が議論の中心だが、`kyoki` 本体が `L3_UNVERIFIED` のため、当面は `P1` で並行追跡

**同期結果**:
- `Docs/SECT-RULESET-MATRIX.template.md` の locator 行を Iteration 24 反映に更新
- `Docs/OPEN-QUESTIONS.md` に初期割当を明文化

**次ループ（Iteration 25）**:
1. `P0` の2種について、高尾学館出版物案内から巻候補を特定
2. 書誌だけでなく、可能なら目次断片の取得
3. `research-isouhou-scope-boundary-v1` の監修質問票を分離起票



