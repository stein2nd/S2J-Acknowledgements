# S2J-Acknowledgements - CHANGELOG

## unreleased

## 0.1.0 - 2026-11-12

初回 npm 公開。

* CLI `init` / `doctor` / `generate`（Vite バンドル、`dist/bin/cli.js`）
* パイプライン: Syft → SPDX マージ → (Feluda) → onot → `output` コピー
* macOS `.app` 解決（明示 → xcodebuild → DerivedData）、SPM checkouts
* JSON Schema 検証、`scripts/test-doctor.sh`、CI dist-zip
* プリセット `macos-app` / `wordpress` / `dir`、`examples/`

### Fixed

* onot `generate -o` は出力ディレクトリ — `OSS_Notice_*.md` を `output` にコピー
