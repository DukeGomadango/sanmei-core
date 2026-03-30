# @sanmei/sanmei-bff

算命学コアの **HTTP 境界**（Hono）。`POST /api/v1/calculate` で [REQUIREMENTS-v1.1.md](../../Docs/REQUIREMENTS-v1.1.md) §7 に沿った JSON を返します。

## 開発

```bash
# リポジトリルートから（推奨）
npm install
npm run build -w @sanmei/sanmei-core
npm run dev -w @sanmei/sanmei-bff
```

既定ポート: `3000`（`PORT` で変更）。

- `GET /` … 最小フォーム（Playground）
- `POST /api/v1/calculate` … リクエストボディは `@sanmei/sanmei-core` の `CalculateInput` と同一 JSON

## テスト

```bash
npm run build -w @sanmei/sanmei-core
npm test
```

成功経路は `toMatchFileSnapshot` で回帰します（`meta` はテスト側で正規化）。

## 依存

`@sanmei/sanmei-core` は **ビルド済み `dist`** を参照します。初回やコア変更後は必ずコアの `npm run build` を先に実行してください。
