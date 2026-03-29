# 第三者ライセンス / データ出所

## `packages/sanmei-core`

- **Skyfield**（MIT）— `tools/solar-term-build/` の節入り JSON 生成のみで使用。ランタイムの `sanmei-core` には含まれません。
- **DE421.bsp**（NASA/JPL; 利用条件は JPL サイト参照）— Skyfield がダウンロードするエフェメリス。生成パイプラインのみ。
- **@js-joda/core / @js-joda/timezone** — 暦ポート初期実装（各パッケージの LICENSE 参照）。
- **Zod** — MIT。
- **Vitest / TypeScript** — 開発依存。

## 節入りマスタ JSON

- 生成: `python tools/solar-term-build/build_solar_terms.py [開始年] [終了年]`
- 既定コミットデータはリポジトリ方針に応じて年範囲を拡張してください（例: `1900 2100` は数分〜十数分程度）。
