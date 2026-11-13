# S2J Acknowledgements - 手動テスト記録

自動テスト (Vitest、`npm run test:doctor`) の補完です。Syft / onot / Feluda が必要な結果だけをここに書きます。

正本手順: [e2e.md](./e2e.md) (`dir` プリセット、mktemp ホスト)。  
macOS 実アプリ (Cozy Brew 等) は [usage.md](./usage.md) と [examples/cozy-brew](../examples/cozy-brew/) を参照し、別行で記録します。

| 日付 | 段階 | 環境 | 手順 | 結果 |
| --- | --- | --- | --- | --- |
| 2026-11-12 | E2E-dir | macOS、Node v26.13、syft v1.57.1、onot v1.2.0 (venv) | [e2e.md](./e2e.md) mktemp + `test/fixtures/ack-dir.config.json` | `doctor` `exit` 0 (`.gitignore` WARN のみ)、`generate` `exit` 0、`ACKNOWLEDGEMENTS.test.md` 作成 (`wrote …`) |
| 2026-11-12 | Cozy Brew-init | [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) 1.0.10、Node/npm、`@s2j/acknowledgements` ^0.1.5 | `npm i -D @s2j/acknowledgements`、`npx s2j-acknowledgements init --preset macos-app` | `exit` 0。`ack.config.json` / `onot.yaml` / `venv/` 作成。`.gitignore` WARN (`build/oss-notice/` 明示行が必要) |
| 2026-11-12 | Cozy Brew-doctor | 同上 (syft v1.57.1、venv onot) | `npx s2j-acknowledgements doctor` | `exit` 0。全項目 OK (`.gitignore` 追記後) |
| 2026-11-12 | Cozy Brew-generate | 同上 (`@s2j/acknowledgements` ^0.1.5)、Release `.app` + DerivedData SPM checkouts | `npx s2j-acknowledgements generate --config ack.config.json` | `exit` 0、`ACKNOWLEDGEMENTS.md` 作成。Components に `.app` / `checkouts` の**絶対パス行**・`actions/*` 等の**ノイズ**あり (Syft マージ SBOM + onot)。SPM 依存の GPL 本文は出力済み |
| 2026-11-12 | Cozy Brew-smoke | [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) 1.0.10、`@s2j/acknowledgements` ^0.1.8 | `init --preset macos-app` → `doctor --config ack.config.json` → `generate --config ack.config.json --dry-run` | いずれも `exit` 0。DerivedData の `CozyBrewApp.app` + `SourcePackages/checkouts` をターゲット解決。`pipeline.feluda: false` |
| 2026-11-12 | Cozy Brew-generate | 同上 (`@s2j/acknowledgements` ^0.1.8) | `generate --config ack.config.json` | `exit` 0、`ACKNOWLEDGEMENTS.md`。stderr: `dropped 2 path-like SPDX package(s) before onot`。Components に **ホスト絶対パス行なし** (同表 v0.1.5 `generate` 比改善)。**誤検出**: checkouts 内レガシー `tools/docs-linter` → `docs-linter` v1.0.4 / GPL-2行 (製品同梱ではない) |
| 2026-11-12 | Cozy Brew-generate | 同上。上流で SPM checkouts から旧 `tools/docs-linter` 除去後に再実行 | `generate --config ack.config.json` | `exit` 0。Components: `CozyBrewApp` 1.0.10、`s2j-about-window` 2.0.14 / `s2j-source-list` 2.0.10 (**GPL-3.0-or-later** 本文のみ)。`docs-linter` 行なし。残ノイズ: `actions/*`・`codecov/*`・`maxim-lobanov/setup-xcode` |
| 2026-11-13 | Cozy Brew-generate | Cozy Brew v1.0.10、`@s2j/acknowledgements` ^0.1.9 (`scan.exclude` + `noticeDenylist` + Feluda) | `generate --config ack.config.json` | `exit` 0。**配布向け Components 確定**: `CozyBrewApp` 1.0.10、`s2j-about-window` 2.0.14、`s2j-source-list` 2.0.10 (GPL-3全文)。CI Action、codecov 等のノイズなし |
| 2026-11-13 | Cozy Brew-UI | 同上。`ACKNOWLEDGEMENTS.md` → `CozyBrewApp/Resources/`、onot `company:` 設定済み | Release ビルド後 [S2J About Window](https://github.com/stein2nd/s2j-about-window) で About → License / Acknowledgements | License 等幅長文、Acknowledgements の **Markdown 表**、GPL 長文、Offer of Source (S2J / GitHub / 連絡先) を確認 |
| 2026-11-13 | Cozy Brew-notice-title | Cozy Brew v1.0.10、`@s2j/acknowledgements` ^0.1.12、`ack.config.json` の `xcode.productName`: `CozyBrewApp.app` (`pipeline.noticeProductName` 未設定) | `generate --config ack.config.json` → Resources 同梱 → Release ビルド、About → Acknowledgements | Notice 見出し **OSS Notice for CozyBrewApp** (`host-sbom` ではない)。Components 表、GPL 長文は従来どおり |
