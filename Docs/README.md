# Sanmeigaku ドキュメント索引

本フォルダは、算命学コア計算エンジン（`sanmei-core`）の**要件・契約・ドメイン参照**および**実装インデックス**をまとめたものです。ソースは同一リポジトリの [packages/sanmei-core](../packages/sanmei-core) にあります。

| 文書 | 内容 |
|------|------|
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | **実装の現状**（ディレクトリマップ・データパイプライン・**§7 ドキュメント／ルール更新チェックリスト**）。仕様と差分が出たらここかコードを更新する |
| [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) | **メイン要件定義**（API、データ構造、学派、節入り、テスト、NFR） |
| [ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md) | Monorepo、Protobuf/JSON、バージョン、ゴールデンテスト、節入りマスタ・時刻補正の方針、Rust 移行 |
| [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) | **3層ドメイン辞書**（Primitives / Core / Dynamic）、型・算出パターン・`ruleset` との分担 |
| [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | 占い師／監修者による確定待ちの論点一覧 |
| [PHASE2-RULESET-AND-DAIUN.md](./PHASE2-RULESET-AND-DAIUN.md) | **フェーズ2**（`takao-v1`・大運本算法・監修ゴールデン）の実装ロードマップ正本。フロント並行可の整理あり |
| [SECT-RULESET-MATRIX.template.md](./SECT-RULESET-MATRIX.template.md) | 学派差分を表形式で固定するテンプレート |
| [RESEARCH-SECT-RULESET-WORKFLOW.md](./RESEARCH-SECT-RULESET-WORKFLOW.md) | `sect: research` を立てるときの調査・採用判定・実装ゲート（出典必須、語彙混線防止） |
| [RESEARCH-SECT-SPEC.md](./RESEARCH-SECT-SPEC.md) | `sect: research` の単一仕様書（出典レベル、位相法、蔵干/二十八元、未確定領域、テスト方針） |
| [PLAN-RESEARCH-YOUSEN-AND-TENCHU.md](./PLAN-RESEARCH-YOUSEN-AND-TENCHU.md) | **研究流派の充実計画**（十大主星・十二大従星の表示名／`tenchuSatsuStatus`・スプリント順。フェーズ2 `takao-v1` とは別スコープ） |
| [RESEARCH-STAR-MATRIX-DIFF-ITER28.md](./RESEARCH-STAR-MATRIX-DIFF-ITER28.md) | 主星・従星の公開表セル突合ログ（Iteration 28 起票、`research` 限定） |
| [`.cursor/rules`](../.cursor/rules) | **Cursor Project Rules**（アーキテクチャ・TS/Python・ドメイン要点。詳細は各 `.mdc` と本フォルダの md を正とする） |
| [AGENTS.md](../AGENTS.md) | Cursor / Agent 向けの短い作業フロー（※ 本 `.mdc` が正本） |
| [sanmei-commits.mdc](../.cursor/rules/sanmei-commits.mdc) | **コミット / PR タイトル**: Conventional Commits の型 ＋ 日本語要約 |

## sanmei-core 実装の所在（Layer1 ＋ Layer2 mock）

- **詳細**: [IMPLEMENTATION.md](./IMPLEMENTATION.md)（モジュール一覧・節入り／**ruleset**（`src/data/rulesets/`・`dist` ミラー）・**L2a/b 済・L2c 設計固定**（`energyData`／`destinyBugs`）・**Layer3 DAG**・経過日数 §5.0・`SanmeiError` §5.0.1・`calculate.ts`・ゴールデン・Zod→Proto）。[REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §6 と応答形の対応は IMPLEMENTATION §2 と突き合わせる。[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) に L2c の監修残タスクあり。
- **パッケージ**: [`packages/sanmei-core`](../packages/sanmei-core)。
- **README / ライセンス**: ルート [README.md](../README.md) ・ [LICENSES.md](../LICENSES.md)。

## バージョン

- **v1.1**: 再現性（`asOf`・TZ）、契約の単一ソース、トレーサビリティ、エラー契約、PII、ゴールデンテスト方針を反映。

## 重要な前提

算命学は**学派・師承・解釈で差異**があります。本仕様は「機械的に再現可能な計算」と「学派スイッチ（`sect`）」で差分を吸収する設計とし、**占いの正誤をシステムが断定しない**こと。解釈文はフロント／LLM 側の責務です。

**再現性（sanmei-core v1）**: `birthDate`／`birthTime` は **`context.timeZone` の民用標準時**として解釈し、同梱の**節入り瞬間マスタ**と比較する。**API 内では真太陽時（均時差・経度）補正は行わず**、学派がそれを要する場合はクライアントが**呼び出し前**に `birthTime` を補正する。節入り・天中殺スライド等の**機械的ルール**は API で一貫返却し、ゴールデンテストと学派別 CI を可能にする。詳細は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md)、[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) を参照してください。

**日柱・日界**: v1 では日柱は**民用暦日の午前 0:00 境界**とし、**23 時（子初）換日は実装しない**。実務の流派差があるため、仕様上の**免責・バグ報告時の参照文**は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §5 を正とする。

**節入りマスタ生成**: 利用する天文庫・データの**ライセンス**は製品形態に影響する。AGPL の Swiss Ephemeris に代わる**生成パイプライン**の方針は [REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §9.2 を参照。
