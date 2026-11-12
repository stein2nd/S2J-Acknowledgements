# S2J Acknowledgements - 手動テスト記録

自動テスト (Vitest、`npm run test:doctor`) の補完です。Syft / onot / Feluda が必要な結果だけをここに書きます。

正本手順: [e2e.md](./e2e.md) (`dir` プリセット・mktemp ホスト)。  
macOS 実アプリ (Cozy Brew 等) は [usage.md](./usage.md) と [examples/cozy-brew](../examples/cozy-brew/) を参照し、別行で記録します。

| 日付 | 段階 | 環境 | 手順 | 結果 |
| --- | --- | --- | --- | --- |
| 2026-11-12 | E2E-dir | macOS, Node v26.13, syft 1.57.1, onot 1.2.0 (venv) | [e2e.md](./e2e.md) mktemp + `test/fixtures/ack-dir.config.json` | `doctor` exit 0 (`.gitignore` WARN のみ)、`generate` exit 0、`ACKNOWLEDGEMENTS.test.md` 作成 (`wrote …`) |
