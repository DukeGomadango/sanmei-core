# 学派 × ルール項目マトリクス（テンプレート）

`rulesetVersion: ______`（例: `2026.03.1`）  
監修者: ______  最終更新: ______

**使い方**: 各 `sect` ごとに列を追加し、実装・ゴールデンテスト・節入りデータの版と同期させる。セルには **ルール ID**（例: `takao-zokan-days-v1`）、`YES` / `NO`、または `NOTE:...` を入れる。下表の **共通** 表記は設計上の仮置きであり、**最終は監修で確定**すること。

| ルール項目 | takao | shugakuin | research | 備考・監修者へのヒント |
|------------|-------|-----------|----------|------------------------|
| 節入り境界の時刻系: **民用標準時**（API 内で真太陽時変換しない） | **共通 (YES)** | **共通 (YES)** | `research-time-required-only-on-boundary-v1` (PENDING) | sanmei-core v1（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) 暦・時刻 **4**）。真太陽時派は**呼び出し前**に `birthTime`（必要なら `birthDate`）を補正。`birthLongitude`／`birthCityCode` は v1 コア未使用。 |
| 節入りマスタ: 事前生成・コア同梱 | **共通 (YES)** | **共通 (YES)** | NOTE:PENDING（既存方針準拠） | Swiss Ephemeris 等でオフライン生成し TS/Rust が同一データを読む方針（[REQUIREMENTS-v1.1.md](./REQUIREMENTS-v1.1.md) §9、[ARCHITECTURE-AND-CONTRACTS.md](./ARCHITECTURE-AND-CONTRACTS.md) §7）。具体テーブル ID・ハッシュは版管理。 |
| 月柱: 節入りで切る | **共通 (YES)** | **共通 (YES)** | NOTE:PENDING（既存方針準拠） | 算命学正統系の前提。[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md)「学派差」参照。 |
| 蔵干: 切替日数テーブル | `takao-zokan-days-v1` | `shugakuin-zokan-days-v1` | `research-zokan-day-switch-table-v1` (PENDING-VERIFICATION, sourceLevel: L2/L1) | **【要監修】** 節入りから何日目で初元→中元→本元と遷移するかの数値配列。学派間差異の主因の一つ。research は草案（申/戌/亥 subset）で一次根拠待ち。 |
| 蔵干: 二十八元配置 | `takao-28gen-v1` | `shugakuin-28gen-v1` | `research-zokan-slot-model-v1` (PENDING) | **【要監修】** 各地支に内包される干の並び（スロット定義）。 |
| 大運: 立運端数処理と起算 | **【要監修】**（例: 四捨五入） | **【要監修】**（例: 切り捨て） | NOTE:PENDING（候補未確定） | 日数÷3 の余り（1 日・2 日）の扱い、起算に誕生日を含めるか等。学派差の主因の一つ。 |
| 大運: 男女順逆行 | **共通 (YES)** | **共通 (YES)** | NOTE:PENDING（候補未確定） | 陽男陰女＝順行、陰男陽女＝逆行のパターンが一般的。**例外や定義の細部は監修で固定**。 |
| 年運天中殺: 周期・期間 | **共通（例: 12 年周期／2 年間）** | **共通（例: 12 年周期／2 年間）** | NOTE:PENDING（候補未確定） | 起算・境界（例: 立春基準の説がある）や「2 年」の数え方は **【要監修】**。表の「共通」は仮ラベル。 |
| 大運天中殺: 期間・スライド有無 | **共通 (YES)** | **共通 (YES)** | NOTE:PENDING（候補未確定） | 大運天中殺の有無・基本スパン（例: 20 年＝2 旬の説）の扱い。**スライドの機械的条件は下段の ruleset**。[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) §8。 |
| `isShifted` 成立条件 | `takao-shift-rules-v1` | `shugakuin-shift-rules-v1` | NOTE:PENDING（候補未確定） | **【要監修】** 初旬・三旬の異常干支、大運同士の干合スライド等。**JSON／DSL**で版管理。**機械的条件の適用は API が行い**、フロントは同条件を再計算しない（[OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) §8）。 |
| 位相法: 対象関係の集合 | **共通（例）** | **共通（例）** | `research-isouhou-pattern-catalog-v1` (PENDING-VERIFICATION, sourceLevel: L2/L1) | 支合・半会・**対冲**・刑・害・干合 等。採用集合と `kind` ID は `ruleset` で列挙。[DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) §3.3。四柱推命表記の「冲」は API では **対冲** に正規化。 |
| `allowGohouInKaku` サブセット | **【要監修】** | **【要監修】** | NOTE:PENDING（候補未確定） | 格法に位相法（半会・支合等）をどこまで織り込むか。 |
| 虚気: 干合 + 月支条件 | `takao-kyoki-matrix-v1` | `shugakuin-kyoki-matrix-v1` | `research-kyoki-overlay-separation-v1` (PENDING) | **【要監修】** 真理値表。 |
| 守護神・忌神マトリクス版 | `takao-shugoshin-v1` | `shugakuin-shugoshin-v1` | NOTE:PENDING（候補未確定） | **【要監修】** 日干×月支の 2 次元表。第一・第二守護神の定義差。 |
| 陰占は三柱（時柱なし） | **共通 (三柱)** | **共通 (三柱)** | `research-core-three-pillars-v1` (PENDING) | [DOMAIN-GLOSSARY.md](./DOMAIN-GLOSSARY.md) §2.1。`birthTime` は節入り境界用のみ。 |

## 付記

- マトリクスと実装が食い違った場合、**実装をマトリクスに合わせる**（マトリクスが正本）。
- 変更時は `rulesetVersion` を上げ、ゴールデンファイルを追加・更新する。
- 「共通」と書いた行でも、教材・学派で例外があればセルを差し替え、**ゴールデンテストで固定**する。
