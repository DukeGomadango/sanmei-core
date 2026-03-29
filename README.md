# Sanmeigaku（算命学コア）

設計ドキュメントは [Docs/](./Docs/) 、実装の現状マップは [**Docs/IMPLEMENTATION.md**](./Docs/IMPLEMENTATION.md)（随時更新用）を参照してください。コードは **Monorepo** の [packages/sanmei-core](./packages/sanmei-core) にあります。

Cursor / AI エージェント向けの作業フローは [AGENTS.md](./AGENTS.md) と [.cursor/rules](./.cursor/rules) を参照してください。コミット規約は [.cursor/rules/sanmei-commits.mdc](./.cursor/rules/sanmei-commits.mdc) です。

## 開発

```bash
npm install
npm test
```

## 節入りデータ生成（Skyfield + DE421）

```bash
pip install -r tools/solar-term-build/requirements.txt
python tools/solar-term-build/build_solar_terms.py 1900 2100
```

出力: `packages/sanmei-core/data/solar-terms/solar_terms.json`

詳細は [LICENSES.md](./LICENSES.md) を参照してください。
