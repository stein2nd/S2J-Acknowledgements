# S2J Acknowledgements - 手動テスト記録

自動テスト (Vitest、`npm run test:doctor`) の補完です。Syft / onot / Feluda が必要な結果だけをここに書きます。

正本手順: [e2e.md](./e2e.md) (`dir` プリセット・mktemp ホスト)。  
macOS 実アプリ (Cozy Brew 等) は [usage.md](./usage.md) と [examples/cozy-brew](../examples/cozy-brew/) を参照し、別行で記録します。

| 日付 | 段階 | 環境 | 手順 | 結果 |
| --- | --- | --- | --- | --- |
| 2026-11-12 | E2E-dir | macOS, Node v26.13, syft 1.57.1, onot 1.2.0 (venv) | [e2e.md](./e2e.md) mktemp + `test/fixtures/ack-dir.config.json` | `doctor` exit 0 (`.gitignore` WARN のみ)、`generate` exit 0、`ACKNOWLEDGEMENTS.test.md` 作成 (`wrote …`) |
| 2026-11-12 | Cozy Brew-init | [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) 1.0.10、Node/npm、`@s2j/acknowledgements` ^0.1.5 | `npm i -D @s2j/acknowledgements`、`npx s2j-acknowledgements init --preset macos-app` | exit 0。`ack.config.json` / `onot.yaml` / `venv/` 作成。`.gitignore` WARN (`build/oss-notice/` 明示行が必要) |
| 2026-11-12 | Cozy Brew-doctor | 同上 (syft 1.57.1、venv onot) | `npx s2j-acknowledgements doctor` | exit 0。全項目 OK (`.gitignore` 追記後) |
| 2026-11-12 | Cozy Brew-generate | 同上、Release `.app` + DerivedData SPM checkouts | `npx s2j-acknowledgements generate --config ack.config.json` | exit 0、`ACKNOWLEDGEMENTS.md` 作成。Components に `.app` / `checkouts` の**絶対パス行**・`actions/*` 等の**ノイズ**あり (Syft マージ SBOM + onot)。SPM 依存の GPL 本文は出力済み |
