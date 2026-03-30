# Sanmeigaku（算命学コア）

**GitHub**: [github.com/DukeGomadango/sanmei-core](https://github.com/DukeGomadango/sanmei-core)

設計ドキュメントは [Docs/](./Docs/) 、実装の現状マップは [**Docs/IMPLEMENTATION.md**](./Docs/IMPLEMENTATION.md)（随時更新用）を参照してください。計算コアは [packages/sanmei-core](./packages/sanmei-core)、HTTP BFF は [packages/sanmei-bff](./packages/sanmei-bff) です。

Cursor / AI エージェント向けの作業フローは [AGENTS.md](./AGENTS.md) と [.cursor/rules](./.cursor/rules) を参照してください。コミット規約は [.cursor/rules/sanmei-commits.mdc](./.cursor/rules/sanmei-commits.mdc) です。

## 開発

```bash
npm install
npm test    # sanmei-core ビルド後、コア Test → BFF Test の順
npm run build
```

Playground を使った開発（推奨）:

```bash
# 1) core を先に build（playground / bff の型参照先）
npm run build -w @sanmei/sanmei-core

# 2) BFF 起動（http://localhost:3000）
npm run dev -w @sanmei/sanmei-bff

# 3) 別ターミナルで Playground 起動（http://localhost:5173）
npm run dev -w @sanmei/sanmei-playground
```

Playground は `/api` を BFF（`localhost:3000`）へプロキシします。

BFF 単体（例）:

```bash
cd packages/sanmei-bff
npm run dev      # tsx watch（コアは先に npm run build -w @sanmei/sanmei-core）
```

## 節入りデータ生成（Skyfield + DE421）

```bash
pip install -r tools/solar-term-build/requirements.txt
python tools/solar-term-build/build_solar_terms.py 1900 2100
```

出力: `packages/sanmei-core/data/solar-terms/solar_terms.json`

詳細は [LICENSES.md](./LICENSES.md) を参照してください。
