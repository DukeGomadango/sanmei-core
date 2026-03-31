# Agent / Cursor 向けメモ

詳細な指示は **`.cursor/rules/`** の `.mdc` を正とする。常時の最小情報は `sanmei-context.mdc`、運用・Docs 同期は `sanmei-doc-sync.mdc`、**コミット文**は `sanmei-commits.mdc`。

作業の流れの要約:

1. **着手前**: `Docs/IMPLEMENTATION.md`（§・システム図）→ 必要なら `DOMAIN-GLOSSARY.md`。
2. **完了時**: コードと一緒に **該当する `Docs/*.md` と `.cursor/rules`** を更新する。手順の**正本**は `Docs/IMPLEMENTATION.md` **§7**（§7.1 運用・§7.2 項目・**§7.3 節目**で全件レビュー）。エージェントは完了報告に §7.2 の**該当項目**を短く列挙する。

人間向けの PR では `.github/pull_request_template.md` を参照。
