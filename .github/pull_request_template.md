## 概要

<!-- 何を変えたか。PR タイトル・merge コミット想定でも Conventional Commits ＋日本語要約（詳細は `.cursor/rules/sanmei-commits.mdc`） -->

## ドキュメント・ルール（該当するものだけ）

実装・境界・データパイプラインを変えた場合は **同じ PR で** 更新してください。**手順**: `Docs/IMPLEMENTATION.md` **§7.1**（§7.2 を目視し、該当項目を処理。該当なしは PR で明示）。

- [ ] §7.2 上記を踏まえ `Docs/IMPLEMENTATION.md` を更新した（§3 / §4 / Mermaid / §5 等、該当箇所）
- [ ] `Docs/DOMAIN-GLOSSARY.md` / `OPEN-QUESTIONS.md` / `REQUIREMENTS-v1.1.md`（契約・用語が変わった場合）
- [ ] `Docs/ARCHITECTURE-AND-CONTRACTS.md`（層・Proto/契約・フェーズが変わった場合）
- [ ] `.cursor/rules/*.mdc`（骨格・層・パス禁則・再発防止 1〜3 行。長文は Docs 側）
- [ ] **節目（§7.3）**に該当する場合: §7.2 **全項目**をレビューし、本 PR で「要更新／該当なし／既に最新」を本文に書いた

凡例: §7 = `Docs/IMPLEMENTATION.md` セクション 7（更新チェックリスト）
