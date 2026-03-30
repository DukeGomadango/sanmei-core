# バックエンド要件定義書 v1.1

**算命学コア計算エンジン（API / ライブラリ）**

| 項目 | 内容 |
|------|------|
| ドキュメント改訂 | v1.1.5（L2c `energyData`／`destinyBugs` の契約骨子・静的／動的天中殺の分離）— ファイル名は従来どおり |
| ステータス | Draft → 監修・実装で更新 |
| 前身 | v1.0 要件＋設計レビュー（再現性・契約・NFR・ゴールデンテスト） |
| 関連文書 | [ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md), [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md), [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) |

---

## 1. システム概要

### 1.1 目的

算命学の**コア計算**をカプセル化した、**完全ステートレス**な計算エンジン（HTTP API および共有ライブラリ）。返却値は**数値・コード・フラグ・構造化データ（JSON）**に限定し、**文章化・鑑定文・心理カウンセリング的表現**はフロントエンド／LLM プロンプト側の責務とする。

### 1.2 開発フェーズ

| フェーズ | 内容 |
|----------|------|
| 第1 | TypeScript で `sanmei-core` を実装。Next.js 等と型共有。ゴールデンテスト資産を蓄積。 |
| 第2 | 高負荷部分を Rust で再実装しマイクロサービス化または WASM。**ゴールデン一致**を完了条件とする。 |

### 1.3 非目標（明示的スコープ外）

- 鑑定文の自動生成品質保証（LLM 側責務）
- 学派の正統性の断定
- 公式占いサイトからのルール抽出・スクレイピング

---

## 2. アーキテクチャ方針

- **Monorepo**: Turborepo 等。`packages/sanmei-core` にドメインロジックを集約。
- **責務分離**: コアは純粋計算に近づける（副作用はログ・外部 I/O を持たない）。万年暦データは**同梱リソース**として読み込む。
- **契約**: データ構造の SSOT は **Protobuf** を第一推奨（代替: OpenAPI / JSON Schema）。**型・フィールド互換**は Proto 等で強制し、**学派アルゴリズムの意味一致**はゴールデンマスターで担保する。詳細は [ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md)。

---

## 3. ドメインと学派（`sect`）

算命学は**流派・学び舎でアルゴリズム差**がある（主に蔵干の切替日数・大運立運の端数等。詳細は [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md)「学派差」）。

### 3.1 `systemConfig.sect`

初期値の例（実装は列挙子で拡張）:

| 値 | 意味（例） |
|----|------------|
| `takao` | 高尾学派／高尾学館系のルールセット |
| `shugakuin` | 朱学院系のルールセット |

### 3.2 学派差分マトリクス（必須アーティファクト）

実装前に、少なくとも以下の次元で **true/false/派生ルール ID** を表にする（算命学正統系では**月柱は節入りで統一**。[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) の「学派差」参照）:

- 蔵干: 初元／中元／本元の**切替日数テーブル**（節入りからの経過日）
- 陰占は**年・月・日の三柱のみ**（時柱は算命学コアに含めない。`birthTime` は節入り境界用のみ。[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) §2.1）
- 大運: **立運の日数÷3 の端数処理**・起算日の数え方・順逆行
- 天中殺（年運／大運）の定義・スライド
- 位相法の集合と格法への取り込み（`allowGohouInKaku`）
- 虚気条件

表は `rulesetVersion` とともに版管理する。未確定項目は [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) に集約。

---

## 4. API 概要

- **メソッド / パス**: `POST /api/v1/calculate`
- **リクエスト / レスポンス**: `application/json; charset=utf-8`
- **冪等性**: 同一ペイロードは同一結果（`engineVersion`・`rulesetVersion` が同じ限り）。

---

## 5. リクエスト仕様（v1.1）

### 5.1 ボディスキーマ（論理）

```json
{
  "user": {
    "birthDate": "2000-01-01",
    "birthTime": "14:30",
    "gender": "male",
    "birthLongitude": 139.6917,
    "birthCityCode": null
  },
  "context": {
    "asOf": "2026-03-28",
    "asOfTime": "12:00:00",
    "timeZone": "Asia/Tokyo"
  },
  "systemConfig": {
    "sect": "takao",
    "allowGohouInKaku": false,
    "rulesetVersion": "2026.03.1",
    "clientRulesetHint": null
  },
  "options": {
    "includeDebugTrace": false
  }
}
```

### 5.2 フィールド説明

#### `user`

| フィールド | 必須 | 説明 |
|------------|------|------|
| `birthDate` | 必須 | グレゴリオ暦 `YYYY-MM-DD`。解釈は `context.timeZone` 基準（第1フェーズは `Asia/Tokyo` 固定でも可だが、仕様には TZ を書く）。 |
| `birthTime` | 条件付き | `HH:mm` または `HH:mm:ss`。**暦・時刻**は `context.timeZone` の**民用標準時**（暦・時刻 **4**）。**節入り日**（マスタ上、その節の入り瞬間を TZ 投影した暦日）と `birthDate` が一致する場合は必須（§7、[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **1**）。 |
| `gender` | 必須 | 大運順行・逆行等に使用。`male` / `female` / 将来拡張用の列挙子。 |
| `birthLongitude` | 任意 | 出生地の**経度（度、東経を正とする）**。**v1 の節入り・蔵干計算では参照しない**（真太陽時はクライアントが `birthTime` を補正して渡す）。将来拡張・表示・デバッグ用に予約可。 |
| `birthCityCode` | 任意 | サーバーが保持する**都市／地域コード**。**v1 コア計算では参照しない**。未使用なら `null`。 |

**出生時刻（`birthTime`）の解釈**

- 算命学コアでは**時柱を生成しない**。`birthTime` は同一暦日内での**節入り境界**など、暦計算にのみ用いる（[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) §2.1）。
- **民用標準時（v1）**: `birthDate`／`birthTime` は **`context.timeZone` の壁時計時刻**として解釈し、同梱マスタの節入り**絶対瞬間**と**単純比較**する。API は**均時差・経度の真太陽時変換を行わない**（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **4**）。学派が真太陽時を要請する場合は、**呼び出し前**にクライアントが補正した `birthTime`（必要なら `birthDate`）を渡す。
- **`rulesetVersion`**: 節入りマスタの生成規約・TzDB 版・採用天文系はリリースノートまたは同梱メタで**1 行以上明示**し、ゴールデンテストと突合する。
- **日柱の日界（sanmei-core v1）**: 日柱（六十甲子の「日」）は **`context.timeZone` における民用暦日**の境界を **午前 0:00（その日の開始）** とする。**子初（一般に 23 時前後の換日）による日付繰り上げは行わない**。命理実務では子刻換日派が存在するため、本仕様は**本エンジン上の一貫した定義**であり、実占との差はドキュメント・クライアント側の説明で吸収する。将来必要なら `rulesetVersion` 等で拡張する。
- **`TIME_REQUIRED_FOR_SOLAR_TERM` の手続き**: 「節入り日」と `birthDate` の一致は、マスタの節入り**絶対瞬間**を `context.timeZone` に変換したうえでの**ローカル暦日 `YYYY-MM-DD`** と、リクエストの `birthDate` を**完全一致**比較して判定する（同一 UTC でも TZ によりローカル日が前後しうる）。
- **デバッグ・説明責任**: `options.includeDebugTrace` が真のとき、節入り判定に用いた内部値（変換後インスタント、参照したマスタ行 ID 等）を `debugTrace` に載せられる（開示は NFR に従う）。均時差・経度補正は v1 コアでは行わないため、`birthLongitude` の「採用経度」は主に**リクエストエコー／将来用**となる。

#### `context`（v1.1 で追加・必須化推奨）

| フィールド | 必須 | 説明 |
|------------|------|------|
| `asOf` | 必須 | 動的タイムラインの基準日 `YYYY-MM-DD`。 |
| `asOfTime` | 任意 | 日単位で足りない場合に使用。 |
| `timeZone` | 必須 | IANA TZ（例: `Asia/Tokyo`）。 |

**理由**: サーバー時刻依存を禁止し、テスト・再現性・「あの日の運勢」を可能にする。

#### `systemConfig`

| フィールド | 必須 | 説明 |
|------------|------|------|
| `sect` | **はい**（コア `calculate` 経路） | 学派。 |
| `allowGohouInKaku` | いいえ | 格法判定に位相法（半会等）を含めるか。 |
| `rulesetVersion` | **はい**（コア `calculate` 経路） | クライアントが期待するルール版。未サポートなら §7。バンドル済みは `mock-v1`・`mock-internal-v2`（検証用）等（[IMPLEMENTATION.md](./IMPLEMENTATION.md) §2・§4.1）。 |
| `clientRulesetHint` | いいえ | 将来の A/B やデバッグ用。 |

#### `options`

| フィールド | 説明 |
|------------|------|
| `includeDebugTrace` | `true` のときのみ詳細トレースを要求できる。BFF は認証/ロール（または管理者キー）で許可された場合のみ Core へ `true` を中継し、それ以外は `false` を強制する。 |

---

## 6. レスポンス仕様（v1.1）

トップレベル例（論理構造）:

```json
{
  "meta": {
    "engineVersion": "0.2.0",
    "rulesetVersion": "2026.03.1",
    "sect": "takao",
    "calculatedAt": "2026-03-28T03:00:00Z"
  },
  "baseProfile": { },
  "dynamicTimeline": { },
  "interactionRules": { }
}
```

### 6.1 `meta`

- **`rulesetVersion` 必須**: フロント・LLM が解釈を固定するため。
- **`calculatedAt`**: サーバ計算完了時刻（UTC, RFC3339）。

### 6.2 `BaseProfile`（静的・生涯不変のハードウェア）

**Phase L2（コア実装の分割）**: `insen`（蔵干含む）・`yousen`・`familyNodes` を先行実装する。**`energyData`**・**`destinyBugs`** は計算系が異なるため **Phase L2c または別 PR** に遅延する（[IMPLEMENTATION.md](./IMPLEMENTATION.md) §2）。

| ブロック | 内容 |
|----------|------|
| `insen` | 陰占: **年柱・月柱・日柱の三柱のみ**の十干十二支。**時柱は算命学コアの出力に含めない**（リクエストの `birthTime` は暦境界用であり、時柱とは別物。[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) §2.1）。Protobuf／OpenAPI 等でも **`timePillar`・`hourStem` 等のフィールドを定義しない**。節入りからの経過に基づく**蔵干（初元・中元・本元）**を `sect` ルールで特定。 |
| `yousen` | 陽占: **十大主星**（5 箇所）、**十二大従星**（3 箇所）。部位は人体図座標または部位 ID で返す。 |
| `energyData` | **Phase L2c**。数理法・行動領域。**入力**は位相法・虚気を**含まない**素の三柱＋蔵干（IMPLEMENTATION §2「Phase L2c」）。**契約**: `totalEnergy`、`actionAreaSize`（1〜4）、`actionAreaGeometry` を **Zod 固定**—幾何は **極座標（角度・度）と面積比**の正規化表現に限定。浮動小数はエンジン内で**固定丸め規則**のうえ整数／固定桁で返し、ゴールデンを安定させる。算法・重みは `ruleset`。位相後の数理は将来 **Layer3**（例: `shadowEnergyData`）で扱う。 |
| `destinyBugs` | **Phase L2c**。**出生時点で確定し生涯不変**の宿命系フラグのみ（例: 宿命天中殺・異常干支）。**年運／大運天中殺・スライド・`asOf` 依存**は `dynamicTimeline.tenchuSatsuStatus` に載せ、本フィールドには**含めない**。`code` は安定文字列（監修確定）。プレースホルダ例: `SHUKUMEI_TENCHUSATSU_YEAR`、`SHUKUMEI_TENCHUSATSU_MONTH`、`IJOU_KANSHI_NORMAL`、`IJOU_KANSHI_DARK`（暗干支。詳細は IMPLEMENTATION §2・OPEN-QUESTIONS）。 |
| `familyNodes` | 六親法: **各ノードに干に加え、柱（年／月／日）および蔵干スロット（初元・中元・本元等）等の座標を必須**とする。干のみのフラットマップは採用しない（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) §11）。配列またはロールキー付きオブジェクトの形は Zod（`schemas/layer2.ts`）で固定する。 |

**星・干・支**: API 内部は**列挙コード**（安定 ID）を正とし、表示ラベルはクライアントの i18n で解決してよい。

**スキーマ上の禁止事項（v1.1）**: `baseProfile.insen` に**時柱相当の optional フィールドを置かない**。将来、四柱推命用の別エンドポイント／別メッセージ型で扱う場合も、本 `CalculateResponse` 型とは分離する。

### 6.3 `DynamicTimeline`（`asOf` 依存）

| ブロック | 内容 |
|----------|------|
| `daiun` | `startAge`（立運年齢。例: 日数÷3 の**丸め規則は ruleset 明記**）、`phases[]`（10 年単位の干支＋星）、`currentPhase`（`asOf` で選択） |
| `annual` | 年運: `asOf` 年の干支・関連星 |
| `monthly` | 月運: `asOf` 月の干支・関連星 |
| `tenchuSatsuStatus` | 天中殺の稼働状況。大運天中殺の**スライド**は **JSON／DSL 化した `ruleset`** で定義し、API が解釈して**ゴールデン可能なフラグ・期間・スコア**を返す。**機械的条件の再計算をフロント専用ロジックに置かない**。問診に依る**ナラティブな説明**のみフロント／LLM の責務（API 出力と矛盾する上書きはしない）。詳細は [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) §8。 |

### 6.4 `InteractionRules`

**Phase L2**: 守護神・忌神の計算は静的ルールで行い、戻り値は本ブロックの **`guardianDeities` / `kishin`** に載せる（Orchestrator の組み立て。位相法・虚気・Priority は後続）。

| ブロック | 内容 |
|----------|------|
| `isouhou` | 位相法: 合法・散法等の配列。各要素に `kind`, `strength`, `involved`, `scope` |
| `kyoki` | 虚気: 成立時 `shadowYousen` を返す。不成立時は `null` または省略。 |
| `guardianDeities` | 守護神（有利五行の配列等） |
| `kishin` | 忌神（避ける五行の配列等） |
| `priorityResolution` | 競合時のスコアリング結果（§8） |
| `debugTrace` | `includeDebugTrace` かつ BFF で許可された場合のみ。`traceVersion` と `nodes[]`（`phase`, `stepId`, `ruleId`, `inputs`, `result`, `reasonCode`）を返す。 |

---

## 7. エラー契約（Error Contract）

HTTP ステータスと機械可読 `code` を組み合わせる。**BFF**（HTTP 境界）がコアの `SanmeiError`・パース失敗を下表にマップする。

### 7.1 HTTP と `code` の対応（固定）

| 状況 | HTTP | `code` | メッセージ方針 |
|------|------|--------|----------------|
| リクエストボディが JSON として解釈できない（空・句法エラー等） | 400 | `MALFORMED_JSON` | ペイロード修正を促す |
| バリデーション失敗（Zod 等） | 400 | `VALIDATION_ERROR` | フィールド別 `details`（flatten 等）を **そのまま**返す |
| TZ 不正・暦変換失敗（コアが `INVALID_TIMEZONE` と判定） | 400 | `INVALID_TIMEZONE` | IANA 名の例示 |
| 未サポートの `rulesetVersion`（構文・型は正しいが版が存在しない） | 422 | `RULESET_VERSION_UNSUPPORTED` | サポート一覧への誘導 |
| 「節入り日」に該当する `birthDate` で `birthTime` が未指定 | 422 | `TIME_REQUIRED_FOR_SOLAR_TERM` | フロントが時刻入力へ誘導（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **1**） |
| `ruleset` 参照で必須データ欠損（配備データの不整合） | 500 | `RULESET_DATA_MISSING` | クライアントは **詳細なし**（運用はサーバログ） |
| 深さ等の計算異常（例: `rawDelta < 0`） | 500 | `CALCULATION_ANOMALY` | クライアントは **詳細なし**（運用はサーバログ） |
| 上記以外の内部エラー・未知の例外 | 500 | （実装から導出または汎用） | クライアントは **詳細なし**（運用はサーバログ） |

### 7.2 `details` の開示ポリシー

- **4xx（400 / 422）**: クライアントが修正可能な内容のため、`details` に **コアが保持する情報を可能な限り含めて**返す（Zod flatten、`TIME_REQUIRED` の理由・節気 ID 等）。
- **5xx（500）**: レスポンスの `details` は **`null` または省略**とし、スタック・内部変数は **サーバログにのみ**出力する。監視（Sentry / Datadog 等）では 5xx をアラート条件にできるよう、サーバ側責務の欠損（`RULESET_DATA_MISSING`）も **500 に統一**する。

### 7.3 `TIME_REQUIRED_FOR_SOLAR_TERM` の `details` 形（コア正・BFF で時刻を JSON 化）

コアは **機械可読な安定 ID** を返す（§6.2 の「星・干・支は列挙コードを正」方針に沿い、節気の**表示名・i18n**はフロント責務）。

- **`solarTerm`**: 二十四節気の **`termId`**（例: `"jingzhe"`）。欠けうる場合は `null`。
- **`reason`**: 理由コード（例: `BIRTH_DATE_EQUALS_SOLAR_TERM_LOCAL_DAY`）。
- **`solarTermInstantUtcMs`**: コア内部・エラー `details` では **UTC エポックミリ秒**（数値）のままよい。

**BFF が JSON レスポンスに載せるとき**: `solarTermInstantUtcMs` が非 `null` なら、**ISO 8601 UTC**（`YYYY-MM-DDThh:mm:ss.sssZ` 形式、`Date.prototype.toISOString()` 相当）へ変換した文字列を **`solarTermInstant`** として返す。`null` のときは `solarTermInstant` を省略するか `null` とする（BFF で統一）。

**HTTP 422 の例**（BFF 出力イメージ）:

```json
{
  "error": {
    "code": "TIME_REQUIRED_FOR_SOLAR_TERM",
    "message": "節入り日前後のため出生時刻が必要です",
    "details": {
      "solarTerm": "jingzhe",
      "solarTermInstant": "2020-02-04T05:00:00.000Z",
      "reason": "BIRTH_DATE_EQUALS_SOLAR_TERM_LOCAL_DAY"
    }
  }
}
```

**不正 JSON の例**（HTTP 400）:

```json
{
  "error": {
    "code": "MALFORMED_JSON",
    "message": "Invalid JSON payload"
  }
}
```

---

## 8. 競合解決（Priority Resolver）

複数のルールが同時成立し UI 上矛盾する場合:

1. 各現象に **`strength`（数値）** と **`priorityTier`（整数）** を付与。
2. ruleset に**タイブレーク順**を定義。
3. レスポンスに **`resolved` / `suppressed`** のリストを含め、フロントと LLM が一貫した説明を行えるようにする。

---

## 9. 万年暦・節入りデータ

### 9.1 方針

太陽黄経から毎リクエスト計算するのではなく、**1900〜2100**（必要なら拡張）の**節入り瞬間**を**分単位**（または秒）で保持した静的データを `sanmei-core` に同梱。**ランタイムでは UTC 等の絶対瞬間として解釈**し、リクエストのローカル日時と比較する（§5「出生時刻の解釈」）。

### 9.2 データソースと生成パイプライン

- **天文計算ライブラリの選定**: **Swiss Ephemeris** は実績がある一方 **GNU Affero GPL**（商用は別ライセンス）であり、閉源商用では**ビルドツール依存も含めた AGPL 伝播**が論点になりうる。**デフォルト方針**: ランタイムは**天文庫に依存せず**同梱マスタのみを読む。マスタ生成は **AGPL に触れない代替**（例: Python **Skyfield** と JPL 系エフェメリス、MIT 系の軽量庁、利用許諾に沿う**公開暦データのオフライン取り込み**）を優先する。Swiss Ephemeris を生成に用いる場合は**法務判断**とリポジトリ上の**ライセンス明記**を前提とする。
- **推奨手順**: **ビルド時（オフライン）**に **1900〜2100**（必要なら拡張）の**節入り瞬間マスタ**を**分・秒単位**で生成する。Rust のバインディング等で生成ツールを実装し、**TS／Rust のランタイムは同一のアーティファクト**（JSON／SQLite 等）を読み込む（計算系の完全統一）。
- 使用ライブラリ・エフェメリス・データの**ライセンス条項**をリポジトリに明記する。
- マスタには **ビルド ID またはコンテンツハッシュ**を付与し、`engineVersion`／メタデータと突合できるようにする。
- 天文アルゴリズム以外の暦表を用いる場合も、**出典・版・計算手順**を文書化し、`rulesetVersion` と紐づける。
- 正統算命学では**月の境界は節入りで共通**だが、同梱データの**出典・版・計算系**が学派・リリースで異なる場合は **テーブル ID を分ける**（[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md)「学派差」）。

### 9.3 性能

- メモリマップ JSON / 専用バイナリ / SQLite のいずれか。起動時読み込み、O(log n) 検索以下を目標。

---

## 10. 非機能要件（NFR）

### 10.1 プライバシー（PII）

- `birthDate` / `birthTime` は強い個人情報。**アクセスログ・APM・エラートレースに生値を残さない**。
- 必要なら **マスキング**（例: 年のみ）または **ソルト付きハッシュ**（同一ユーザ再計算のキーに注意）。
- 占い結果 JSON 全体をログに出す場合は**最小化**と保存期間のポリシーを別途定義。

### 10.2 セキュリティ

- HTTPS 必須。API キーまたはセッションはプロダクト要件に従う。
- レート制限（公開 API の場合）。

### 10.3 性能・信頼性

- 目標 p95 レイテンシ（例: 単一計算 50ms 以下 @ 基準マシン）はプロダクトで数値化。
- タイムアウト・同時実行数はインフラ側で制御。

### 10.4 観測可能性

- `traceId`, `rulesetVersion`, `sect` はログ可能。
- 個人識別子は分離。

---

## 11. テスト戦略

1. **単体テスト**: 干支変換・節入り検索・スコア計算の純関数。
2. **ゴールデンマスター**: [ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md) §6 に従い、**正規化 JSON または構造同値**で比較。**開発初期から**監修合意済みの**学派別正解ペア**（目安: **各 `sect` 数十件**）を CI で回し、Rust 移行時も**同一フィクスチャ一致**を完了条件とする（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) §13）。
3. **契約テスト**: Proto / OpenAPI と実レスポンスの整合。
4. **監修受け入れ**: 学派別サンプルの目視＋計算一致。

---

## 12. UI / UX 連携メモ（バックエンド視点）

- 巨大 JSON を一度に表示せず、**フェーズに応じた部分取得**は BFF またはクエリパラメータで検討（v2 以降）。
- v1.1 では単一エンドポイント全返却でもよいが、**フィールドグループの安定した命名**でフロントの段階開示を支援する。

---

## 13. 改訂履歴

| 版 | 内容 |
|----|------|
| v1.0 | 初版要件（ステートレス、JSON 出力、万年暦 DB、Priority、UI 方針） |
| v1.1 | `asOf`／TZ、`rulesetVersion`、エラー契約、PII、Protobuf SSOT、トレーサビリティ、ゴールデン比較方法、学派マトリクス義務化 |
| v1.1.1 | `insen` から時柱を排除し三柱のみをスキーマ上も固定。学派差説明・節入りデータ注記・`familyNodes`／天中殺の OPEN-QUESTIONS 参照を整合 |
| v1.1.2 | 真太陽時・経度を **API コア責務**と明記（`birthLongitude` / `birthCityCode`）。節入りマスタの **Swiss Ephemeris 想定パイプライン**と TS/Rust 共有。天中殺スライドの **API／フロント責務境界**を OPEN-QUESTIONS と整合。ゴールデン早期 CI をテスト戦略に追記。Proto SSOT とゴールデンの役割分担を §2 に明文化 |
| v1.1.3 | **sanmei-core v1** で暦を固定: 節入り境界は \(t \ge t_s\) で当月、**節入り日一致時のみ** `TIME_REQUIRED_FOR_SOLAR_TERM`。民用標準時として解釈し**API 内では真太陽時変換しない**（補正はクライアント任意）。`birthLongitude` / `birthCityCode` は v1 コア未使用。OPEN-QUESTIONS・ARCHITECTURE §7 と整合 |
| v1.1.4 | §9.2: Swiss Ephemeris AGPL リスクと**代替生成**を明記。§5: **日柱は民用0:00日界**・**子初換日は v1 未対応**、`TIME_REQUIRED` の **TZ 変換後ローカル日付**での一致判定を明記 |
| v1.1.5 | §6.2: L2c の **`energyData`**（素の器・幾何正規化・丸め）・**`destinyBugs`**（静的のみ、動的天中殺は §6.3）を具体化。IMPLEMENTATION §2・GLOSSARY と整合 |
| v1.1.6 | §7: **`RULESET_VERSION_UNSUPPORTED` を 422 に統一**、**`RULESET_DATA_MISSING` を 500 に統一**。**`MALFORMED_JSON`（400）**を追加。4xx は `details` 開示・5xx はマスク。`TIME_REQUIRED` の例を **コアの `termId`＋BFF の ISO `solarTermInstant`** に整合 |

---

## 付録 A: v1.0 からの対応表

| v1.0 論点 | v1.1 の扱い |
|-----------|-------------|
| ステートレス | `context.asOf` + TZ で完全決定 |
| JSON 出力 | 維持。SSOT は Proto 等 |
| 節入り DB | 維持。学派別データ方針を追記 |
| Priority Resolver | `priorityResolution` で構造化 |
| LLM に解釈委譲 | 維持。`meta.rulesetVersion` でプロンプト固定 |
