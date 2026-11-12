# S2J-Acknowledgements - CHANGELOG

## unreleased

## 0.1.2 - 2026-11-12

### Fixed

* `dist:zip`: archiver v8 の named export (`ZipArchive`) に合わせる（CI Build & zip）

## 0.1.1 - 2026-11-12

### Fixed

* CI: TypeScript を 5.8 系に固定し `typescript-eslint` との互換を回復
* CI: GitHub Actions `checkout` / `setup-node` / `upload-artifact` を v5 に更新

### Changed

* Prettier によるソース・設定ファイルの整形

## 0.1.0 - 2026-11-12

初回 npm 公開。

* CLI `init` / `doctor` / `generate` (Vite バンドル、`dist/bin/cli.js`)
* パイプライン: Syft → SPDX マージ → (Feluda) → onot → `output` コピー
* macOS `.app` 解決 (明示 → xcodebuild → DerivedData)、SPM checkouts
* JSON Schema 検証、`scripts/test-doctor.sh`、CI dist-zip
* プリセット `macos-app` / `wordpress` / `dir`、`examples/`

### Fixed

* onot `generate -o` は出力ディレクトリ — `OSS_Notice_*.md` を `output` にコピー
