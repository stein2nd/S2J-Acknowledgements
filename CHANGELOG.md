# S2J-Acknowledgements - CHANGELOG

## unreleased

## 0.1.4 - 2026-11-12

### Added

* CI: tag /手動実行用 `npm-publish` workflow (Secret `NPM_TOKEN`)

### Changed

* docs: GitHub Release、dist-zip と npm registry は別途 `npm publish` が必要である旨を [publish.md](./docs/publish.md) に明記
* docs: registry `latest` と Git tag の差分を status / implementation に反映

## 0.1.3 - 2026-11-12

### Fixed

* CI: `upload-artifact@v7` (Action ランタイム node v24)、ランナー `ubuntu-24.04` 固定

## 0.1.2 - 2026-11-12

### Fixed

* `dist:zip`: archiver v8の `ZipArchive` 利用 (default export 廃止に追随)
* CI: dist-zip の Lint / Test / Build & zip がタグ push で通るよう調整

## 0.1.1 - 2026-11-12

### Fixed

* CI: TypeScript `~5.8.3` + `overrides` で TS v7混入を防止 (`typescript-eslint` 互換)
* CI: `checkout` / `setup-node` / `upload-artifact` を v5系に更新

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
