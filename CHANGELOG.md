# S2J-Acknowledgements - CHANGELOG

## unreleased

## 0.1.11 - 2026-11-13

### Added

* `pipeline.noticeProductName` — 全プリセット共通の Notice 製品名 (`xcode.productName` より優先)
* `doctor` / `generate`: 製品名の未設定で SPDX 名が `host-sbom` のとき WARN

### Changed

* SPDX 前処理のドキュメント名: `pipeline.noticeProductName` → `xcode.productName` (`.app` 除去) → `host-sbom`

## 0.1.10 - 2026-11-13

### Fixed

* macOS: `xcodebuild -showBuildSettings` 解決で `xcode.productName` を優先し、依存 framework の `WRAPPER_NAME` を `.app` と誤認しない (`parse-build-settings` / `resolve-app`)

### Changed

* `init` 用 `onot.yaml` ひな型を onot **1.2.x** の `company:` ネストに更新 (`presets/shared`・`presets/macos-app`)
* [examples/cozy-brew](./examples/cozy-brew/) — `scheme` / `productName` を **CozyBrewApp** に修正

### Added

* Vitest — `productName` 優先と非 `.app` `WRAPPER_NAME` の扱い
* docs: [config-schema.md](./docs/config-schema.md) に onot v1.2 `company:` 例とフラット YAML 不可の注記

## 0.1.9 - 2026-11-12

### Added

* `macos-app`: デフォルト `scan.exclude` (`.github` / `.git` / `node_modules`) と `pipeline.noticeDenylist` (CI Action 名など)
* SPDX 前処理: `pipeline.noticeDenylist` で glob 一致 package を除去

### Changed

* `macos-app`: デフォルト `pipeline.feluda: true` (配布用 Notice)。`dir` は従来どおり `false`
* docs / examples: Cozy Brew `ack.config.json` を上記デフォルトに同期

## 0.1.8 - 2026-11-12

### Fixed

* CI dist-zip: `test-doctor.sh` ACK-002を `generate` デフォルト設定 (`ack.config.json`) に合わせて更新
* docs: [cli.md](./docs/cli.md) に `generate` 設定解決と ACK-001〜006表を追記

## 0.1.7 - 2026-11-12

### Fixed

* CI dist-zip: `format:check` 未通過だった `pipeline` / `generate` / `spdx-anonymize` (+ test) を Prettier 整形

## 0.1.6 - 2026-11-12

### Added

* `prepareSpdxFile`: マージ後 SBOM を匿名化 (`{SCAN:*}` / `{HOST_ROOT}` / `{HOME}`) し、パス型 `packages[].name` を除去してから Feluda / onot に渡す
* Feluda 有効例: [examples/cozy-brew/ack.config.feluda.example.json](./examples/cozy-brew/ack.config.feluda.example.json)

### Fixed

* `generate`: `--config` 省略時は `{cwd}/ack.config.json` (`doctor` と同じ)

### Changed

* docs: [pipeline.md](./docs/pipeline.md) に前処理手順、macOS 実ホストでの Feluda 推奨
* docs: Cozy Brew `init` / `doctor` / `generate` 記録を [test-results.md](./docs/test-results.md) に追記

## 0.1.5 - 2026-11-12

### Changed

* docs: npm `latest` **0.1.4** 確定後の status / implementation (P5-04完了)
* docs: 公開直後の確認に `npm view … --prefer-online` を [publish.md](./docs/publish.md) に追記

## 0.1.4 - 2026-11-12

### Added

* CI: tag / 手動実行用 `npm-publish` workflow (Secret `NPM_TOKEN`)

### Changed

* docs: GitHub Release、dist-zip と npm registry は別途 publish が必要である旨を [publish.md](./docs/publish.md) に明記

### Release

* npm: `@s2j/acknowledgements@0.1.4` を registry の `latest` に反映 (Actions `npm-publish`)

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
