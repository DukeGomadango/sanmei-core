# アーキテクチャと契約（スキーマ・テスト・移行）

## 1. リポジトリ・パッケージ構成（方針）

- **Monorepo**（Turborepo 等）を採用し、計算ロジックを `packages/sanmei-core` に集約。
- フロント（Next.js 等）は同一モノレポから型安全に import、または API 経由で利用。
- バックエンド API は**ステートレス**: 入力＋`asOf`＋設定で出力が完全決定。

---

## 2. 契約の単一ソース（SSOT）

### 2.1 問題意識

- 外部向け最終表現は **JSON** が自然。
- しかし **TS 手書き型**と**Rust 手書き struct**の二重管理は、複雑ドメインで**スキーマドリフト**を招く。

### 2.2 推奨: Protobuf を正本とする

- 陰占・位相法・トレース等の**フィールド構造が複雑**なため、手書きの TypeScript 型と Rust `struct` を別々に保守するとスキーマドリフトしやすい。**`.proto` を正本**にし、生成コードへ寄せて**インターフェースを同期**する（意味の正しさ自体はゴールデンテストで担保）。
- `.proto` に `BaseProfile` / `DynamicTimeline` / `InteractionRules` 等の**永続的なフィールド構造**を定義。
- `BaseProfile.insen` は**年・月・日の三柱のみ**とし、時柱相当の optional フィールドは置かない（[REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §6.2）。
- 生成物:
  - TypeScript: 型＋（任意）ランタイムバリデーション連携
  - Rust: `struct` ＋ `serde` 連携や `prost` 等
- **HTTP レスポンス**は `Content-Type: application/json` でよい。JSON は **Protobuf の公式 JSON Mapping** に従ってシリアライズするか、または OpenAPI で JSON 形を固定し proto と同期を `buf` 等で検証する。

### 2.3 代替案（フェーズ戦略）

第1フェーズで protobuf 導入の**初期負荷**が気になる場合（編集作業自体はエージェント支援で軽減しやすい一方、**後方互換のモデリング・`buf`/`protoc` と CI の初期セットアップ**はフェーズによっては重くなり得る）:

1. **JSON Schema または OpenAPI 3.1** を SSOT とし、TS／（将来）Rust 用に codegen。
2. 第2フェーズ前に **Proto へ移行**し、フィールド番号付きで後方互換を強化。

**判断基準**: Rust マイクロサービス境界が明確で CI が整っているなら **早期 Protobuf** が有利。単一 Node プロセス内のみなら **OpenAPI 先行**も現実的。

**Layer 1（実装計画との整合）**: Primitives 中心の段階では **TypeScript + Zod または TypeBox** で契約・ランタイム検証し、スキーマが肥大化したら Proto / OpenAPI を追加する方針でもよい（初期 velocity 優先）。

**Layer 2（実装計画との整合）**: フィールドが複雑化する段階でも、当面は **TypeScript + Zod** で契約を拡張し、条件分岐は **`ruleset` JSON（監修版・検証用 mock 版のいずれも）** に寄せる。Proto を SSOT とする**移行タイミング**は [IMPLEMENTATION.md](./IMPLEMENTATION.md) §5.1 を参照。

### 2.4 `sanmei-core` と HTTP／BFF の責務分界

- **コア**（`packages/sanmei-core/src/calculate.ts` オーケストレータを含む）は、生の出生ペイロードと **`systemConfig.sect` / `systemConfig.rulesetVersion`（必須）**、節入りマスタを用いて**境界計算と（現状 mock のみ）Layer2 適用まで**完結させる。`TIME_REQUIRED_FOR_SOLAR_TERM` 等は**型付きドメインエラー**（`SanmeiError`、`code` 一覧は [IMPLEMENTATION.md](./IMPLEMENTATION.md) §5.0.1）としてコアが送出しうる。
- **BFF／HTTP 層**は上記エラーを **HTTP 422** および要件書の `code` に**マップ**する。呼び出し側に「節入り判定を行ってからコアへ渡せ」と**天文学ロジックを要求しない**（二重実装と逸脱の防止）。
- Layer2 の純関数・リゾルバは、**既に確定した三柱＋深さ**などを入力とし、テストで暦をモックしない方針と整合する。詳細は [IMPLEMENTATION.md](./IMPLEMENTATION.md) §2・§5.0。

**オーケストレータの実行 DAG（採用）**: Layer1（暦・三柱＋深さ）→ Layer2a/b（蔵干・主従星・六親・守護神忌神の組み立て）→ **Layer2c**（`energyData`・`destinyBugs`。位相・虚気は**入力に含めない**）→ Layer3a（位相法・虚気）→ Layer3b（格法・`allowGohouInKaku`）。レスポンス JSON のキー並びとは独立に、**依存関係**はこの順を正とする。全体像は [IMPLEMENTATION.md](./IMPLEMENTATION.md) §2「Orchestrator 実行順」。

---

## 3. バージョンと後方互換

| 項目 | 役割 |
|------|------|
| `engineVersion` | 実装バイナリ／ライブラリの版 |
| `rulesetId` / `rulesetVersion` | 占いルール（節入り含む／除外、大運算法、位相法セット）の版 |

- レスポンスに **`rulesetVersion`（必須）** を含め、フロント・LLM プロンプトはこれに紐づける。
- **破壊的変更**は `rulesetVersion` を上げ、ゴールデンファイルを分岐。

---

## 4. トレーサビリティ（InteractionRules）

フロントの説明責任・デバッグのため、相互作用は次を推奨:

- `phenomena[]`: 各要素に `kind`（例: `LEGAL_HALF_UNION`）、`score`、`scope`（宿命内／大運／年運…）、`involvedPillars`、`notes`（機械可読コード）
- **デバッグ専用の拡張ブロック** `debugTrace`（オプション、認証付き API のみ等）で詳細ログを分離可能

---

## 5. 競合解決（Priority Resolver）

- 天中殺・合法・散法などが同時成立する場合、**数値スコア**と**採用／却下の理由コード**を返す。
- フロントはスコアで UI 強調度を変え、LLM は `trace` を根拠に要約できる。

---

## 6. ゴールデンマスターテスト（TS → Rust の架け橋）

### 6.1 方針

- 入力フィクスチャ（JSON）と期待出力（JSON）を**数百件**規模でリポジトリ管理（**開発初期から**監修合意済みの**学派別サンプルを数十件**載せ、CI を回すことを推奨。蓄積は後からでもよいが、Rust 再実装の安全装置として早期投資が効く）。
- **内部整合ゴールデン（Layer2 開発・`mock-*` ruleset 向け）**: 外部サイトや文献の「正解」との一致を主眼にしない。**リポジトリが採用するモック `ruleset` のルールを手計算またはトレース可能な手順で追ったときに得られる期待 JSON** を正とし、CI 失敗を**実装バグ／フィクスチャ更新漏れ**に収束させる。監修データ到着後は、同じ比較方法で**別名前空間**のゴールデン（`rulesetVersion` 単位）を追加する。
- カテゴリ:
  - **境界値**: 節入り直前直後、閏月、大運切替年、天中殺スライド疑義ケース、**蔵干切替に効く経過日数の境界**
  - **Regression**: バグで一度壊したケース
  - **監修サンプル**: 占い師手計算と一致する既知例（学派別）

### 6.2 比較方法（重要）

**生 JSON のバイト一致は非推奨**（キー順、空白、浮動小数点表記の差で壊れる）。

推奨:

1. JSON をパースし**正規化**（キー順序固定、数値フォーマット固定）した上でバイト比較、または  
2. **意味的ディープイコール**（構造同値）で比較

浮動小数が入る場合は**丸め規則**を `ruleset` に明記。

### 6.3 CI

- TS 実装・Rust 実装の両方が同一フィクスチャを消費。
- `rulesetVersion` ごとにサブディレクトリを分ける。

---

## 7. 節入りマスタ・時刻補正（ランタイム方針の要約）

詳細は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §5（リクエスト）・§9（万年暦）、[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **1・4** を正とする。要旨:

- **sanmei-core v1**: `birthDate`／`birthTime` は **`context.timeZone` の民用標準時**として解釈し、同梱マスタの節入り**絶対瞬間**とタイムライン上で比較する。**均時差・経度による真太陽時変換は API 内では行わない**。真太陽時派は**呼び出し前**に補正済み時刻を渡す（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **4**）。
- **節入り瞬間**はリクエストごとの天体計算ではなく、**事前生成した静的マスタ**（JSON／SQLite 等）を `sanmei-core` に**同梱**し、TS 実装と Rust 再実装が**同一データ**を読む（計算系の単一化）。
- マスタ生成パイプライン（目安: **1900〜2100**、分または秒単位）は **Swiss Ephemeris（swisseph）等の標準的な天文計算**と `rulesetVersion` で定義した計算仕様に基づき、**オフラインビルド**で行う。生成物のハッシュまたは版 ID をメタデータに含め、ライセンス条項（ephemeris ライブラリの利用条件）をリポジトリに明記する。

---

## 8. 第2フェーズ: Rust マイクロサービス

- **トランスパイル**というより **アルゴリズムの再実装＋ゴールデン一致**を完了条件とする。
- WASM でクライアント実行するか、マイクロサービスで CPU 集約するかは負荷特性次第。

---

## 9. ログと観測可能性（概要）

詳細は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) の NFR を正とする。要旨:

- アクセスログに **生年月日・生時を出さない**（マスキングまたはハッシュ＋ソルト方針を別紙で定義）。
- トレース ID と `rulesetVersion` は記録してよい。
