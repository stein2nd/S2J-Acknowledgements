# S2J Acknowledgements - 実装状況

最終更新: 2026-11-13

索引は [specs.md](./specs.md) です。タスク ID の正本は [implementation.md](./implementation.md) です。

**npm:** `@s2j/acknowledgements` **0.1.11** (`latest`、tag `v0.1.11` + [npm-publish](../.github/workflows/npm-publish.yml) + dist-zip CI)。

**v1到達 (2026-11-13):** `dir` 手動 E2E、npm 公開・[S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) で `init` / `doctor` / `generate` / Resources 同梱 / [S2J About Window](https://github.com/stein2nd/s2j-about-window) の License、Acknowledgements 表示まで確認 ([test-results.md](./test-results.md))。

## 仕様書 (参照元)

* [specs.md](./specs.md) — 索引・正本マトリックス
* [cli.md](./cli.md) / [pipeline.md](./pipeline.md) / [config-schema.md](./config-schema.md) / [presets.md](./presets.md)
* [xcode-target-resolution.md](./xcode-target-resolution.md) — macOS `.app` 解決
* [install.md](./install.md) — Syft / onot / Feluda / venv
* [e2e.md](./e2e.md) / [test-results.md](./test-results.md) — 手動 E2E と記録
* [publish.md](./publish.md) — npm 公開手順
* [decisions/](./decisions/) — ADR-001–003
* [implementation.md](./implementation.md) — フェーズ別タスク ID

## 機能一覧

**完了条件列:** 100% 到達用チェックリスト。`[x]` = 満たし済み、`[ ]` = 未。詳細は各§のアンカーに。

**実装％** は、各§の **リポジトリ内で検証可能** な項 (`[x]` / その全数) のみとします。npm 公開実行、Cozy Brew 実機 smoke は [§v1 ゲート外・任意](#status-gates) に分離しますが、Cozy Brew は [test-results.md](./test-results.md) で追跡済みです。

| 機能名 | 実装済み/未実装 | 実装％ | 完了条件 (100%) |
| --- | --- | --- | --- |
| 仕様 (`docs/`) | 確定 | — | [§仕様](#status-spec-docs) |
| リポジトリ骨格 (フェーズ0) | 実装済み | 100 | [§骨格](#status-skeleton) (8/8) |
| `doctor` (フェーズ1) | 実装済み | 100 | [§doctor](#status-doctor) (6/6) |
| 設定・`init` (フェーズ2) | 実装済み | 100 | [§設定・init](#status-config-init) (6/6) |
| macOS ターゲット解決 (フェーズ3) | 実装済み | 100 | [§Xcode 解決](#status-xcode) (5/5) |
| 生成パイプライン (フェーズ4) | 実装済み | 100 | [§パイプライン](#status-pipeline) (11/11) |
| ホスト統合 (フェーズ5) | 実装済み | 100 | [§ホスト統合](#status-host) (4/4) |
| ドキュメント・リリース (フェーズ6) | 実装済み | 100 | [§ドキュメント](#status-docs-release) (3/3) |
| 品質、CI | 実装済み | 100 | [§品質・CI](#status-quality) (7/7) |

**v1全体 (上表の加重なし平均):** **100%** (仕様行・ゲート外 G1〜 G3を除くチェックリスト完走)。

## 100% 完了条件チェックリスト

各§は **実装 → `npm run test` / 手動 smoke** の順。タスク ID は [implementation.md](./implementation.md) に対応。

### 仕様 {#status-spec-docs}

* [x] 正本が `docs/`、`docs_mod/` はスナップショット ([decisions/002-canonical-sources.md](./decisions/002-canonical-sources.md))
* [x] ADR-001–003 (venv、`composer.lock` 非対象、SPDX マージ)
* [x] `schema/ack.config.schema.json` + [config-schema.md](./config-schema.md) 同期 (`pipeline.noticeDenylist` 等含む)

### 骨格 {#status-skeleton}

正本: [layout.md](./layout.md)

* [x] P0-01: `@s2j/acknowledgements`、`bin`、`engines` >= Node v22
* [x] P0-02: Vite SSR → `dist/bin/cli.js`
* [x] P0-03: `--help`、`init` / `doctor` / `generate` ルーティング
* [x] P0-04: `presets/` 3種 + `shared/onot.yaml.example`
* [x] P0-05: `config/recommended-tools.json`、`doctor` 参照
* [x] P0-06: JSON Schema 同梱
* [x] P0-07: ESLint / Prettier / Vitest、`npm run lint` / `test`
* [x] P0-08: [`.github/workflows/dist-zip.yml`](../.github/workflows/dist-zip.yml)、`npm run dist`

### doctor {#status-doctor}

正本: [cli.md](./cli.md)

* [x] P1-01: `which` + バージョン (syft、onot; 推奨版 WARN は簡易)
* [x] P1-02: Python v3.11+
* [x] P1-03: Feluda 任意 (`--config` / `ACK_CONFIG` ありの場合)
* [x] P1-06: `.gitignore` 行判定
* [x] P1-04: exit code 契約 (`test-doctor.sh` ACK-001〜006、[cli.md](./cli.md))
* [x] P1-05: [scripts/test-doctor.sh](../scripts/test-doctor.sh) + CI

#### Test

* [x] Vitest (gitignore 等)
* [x] `npm run test:doctor` を dist-zip CI に組込み

### 設定、init {#status-config-init}

正本: [config-schema.md](./config-schema.md)、[decisions/001-venv-and-init.md](./decisions/001-venv-and-init.md)

* [x] P2-02: プリセットマージ (`presets/<name>/defaults.json`)
* [x] P2-03: Schema 同梱
* [x] P2-04: `init`: `ack.config.json`、`onot.yaml` (onot **1.2.x** は `company:` ネスト)、`python3 -m venv ./venv`、onot pip
* [x] P2-05: `.gitignore` 案内・`--write-gitignore`
* [x] P2-06: onot 解決 (`venv/bin/onot` 優先) を `doctor` / `generate` で共有
* [x] P2-01: `generate` 前の JSON Schema 検証 (Ajv)

#### Test

* [x] `loadMergedAckConfig` / パイプライン dry-run fixture
* [x] 不正設定で exit `2` (ACK-005、`validate-ack-config` Vitest)

### Xcode 解決 {#status-Xcode}

正本: [xcode-target-resolution.md](./xcode-target-resolution.md)

* [x] P3-01: 明示 `appPath` / `ACK_APP` / `--app`
* [x] P3-02: `xcodebuild -showBuildSettings` (`xcode.project` + `scheme`)
* [x] P3-03: DerivedData glob (`xcode.productName` 優先、mtime)
* [x] P3-04: SPM `SourcePackages/checkouts` (DerivedData → env → `.build/checkouts`)
* [x] P3-05: `project.yml` の `name:` (ベストエフォート)

#### Test

* [x] Vitest: `parse-build-settings`、`derived-data`、`resolve-app` (明示 `.app`)、`project-yml`、SPDX ドキュメント名 (**31** 件中 Xcode / SPDX 関連含む)
* [x] 実ホスト (Cozy Brew): Release ビルド後 `generate` (v0.1.9配布向け Components) + About UI — [test-results.md](./test-results.md) 2026-11-13

### パイプライン {#status-pipeline}

正本: [pipeline.md](./pipeline.md)、[decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md)

* [x] P4-01: Syft → SPDX JSON (複数 `dir:`、`scan.exclude`、`syft.extraArgs`)
* [x] P4-02: SPDX マージ (`name@version`)
* [x] P4-03: Feluda `--sbom-input` / `--sbom-enriched` (`pipeline.feludaArgs` オーバーライト)
* [x] P4-04: onot `generate` (md)、`-o` は `{workDir}/onot-notice/` ディレクトリ
* [x] P4-05: 成果物を `output` にコピー (`OSS_Notice_*.md` を検出)、中間ファイル整理
* [x] P4-05: `workDir` ポリシー (`output` 外はディレクトリ削除、内側は中間のみ)
* [x] P4-06: `--dry-run`、`--verbose`、`--keep-intermediate`、`--skip-feluda`
* [x] スキャン対象解決 (`dir` / `wordpress` / `macos-app` + [§Xcode 解決](#status-xcode))
* [x] SPDX 前処理 (`prepareSpdxFile`: パス匿名化、`pipeline.noticeProductName` / `xcode.productName` → onot 見出し、generic WARN)
* [x] `generate` デフォルト設定 `{cwd}/ack.config.json` (`doctor` と同型、ACK-002)
* [x] `macos-app` デフォルト: `scan.exclude` (`.github` 等)、`pipeline.feluda: true`、`noticeDenylist` (CI Action)

#### Test

* [x] Vitest: `spdx-merge`、`spdx-anonymize`、`pipeline` dry-run、`workdir-cleanup`、`onot-output`
* [x] onot あり E2E (`dir`): [e2e.md](./e2e.md)、記録 [test-results.md](./test-results.md) 2026-11-12

### ホスト統合 {#status-host}

* [x] P5-01: [examples/cozy-brew](../examples/cozy-brew/) `ack.config.json` (`scheme` / `productName`: **CozyBrewApp**、v0.1.9パイプラインデフォルトと同期)
* [x] P5-02: `package.json.scripts.example` (`ack:*`)
* [x] P5-03: [examples/wordpress-plugin](../examples/wordpress-plugin/) README 付き例
* [x] P5-04: npm 公開 ([publish.md](./publish.md)、**latest v0.1.11**、tag `v0.1.11` まで運用)

### ドキュメント・リリース {#status-docs-release}

* [x] P6-01: `docs_mod/` 確定版を `docs/` に移行
* [x] P6-02: README クイックスタート ([README.md](../README.md))
* [x] P6-03: CHANGELOG / Git tag **v0.1.0… v0.1.11**

### 品質、CI {#status-quality}

* [x] `npm run lint`: ESLint + `tsc --noEmit`
* [x] `npm run test`: Vitest (**35** 件、パイプライン、SPDX / Notice 名、Xcode 純関数等)
* [x] `npm run test:doctor`: ACK-001〜006
* [x] `npm run build` / `prepare` → 配布可能 `dist/bin/cli.js`
* [x] `npm run dist` + CI dist-zip (Lint → Test → Build & zip → artifact)
* [x] [`.github/workflows/npm-publish.yml`](../.github/workflows/npm-publish.yml): tag `v*` で publish (0.1.4〜0.1.11)
* [x] Node v22 `engines` と workflow 整合 (`ubuntu-24.04`)

## v1ゲート外・任意 {#status-gates}

**100% 分母外** (完了しても機能一覧の％は変えない場合あり)。

| # | 内容 | 備考 |
| --- | --- | --- |
| G1 | `mdfind` による `.app` 最終手段 | [xcode-target-resolution.md](./xcode-target-resolution.md) |
| G2 | `docs-lint` CI | 姉妹 Docs Linter 同型 (任意) |
| G3 | Windows ターゲット解決 | v1非目標 |
| G4 | 実ホスト (Cozy Brew / WP) で `macos-app` / `wordpress` generate | **Cozy Brew 済** — generate + About で表・長文 License 表示まで ([test-results.md](./test-results.md) 2026-11-13に UI 行)。**WordPress 実ホストは未** |
| G5 | npm 公開の実コマンド実行 | **済** — registry `latest` **0.1.11** |

## 補足

* **実装％** は各§チェックリストの `[x]` 比率 (仕様行・ゲート外を除く)。
* タスクの粒度、ID は [implementation.md](./implementation.md) を正本とし、本ファイルは集計と完了条件のみを持つ。implementation の個別バージョン表記が古い場合は本ファイルと [CHANGELOG.md](../CHANGELOG.md) を優先。
* Cozy Brew 検証で判明した **ホスト側前提:** Release 構成で `.app` を DerivedData に置くこと、`ack.config.json` の `xcode.scheme` / `productName` が実ターゲットと一致すること、`onot.yaml` が onot v1.2の `company:` 形であること。

## 実装ロードマップ (到達順)

1. **骨格 + 品質 + パイプライン + Xcode** — 済
2. **Schema 検証、Feluda、workDir、test-doctor、onot 出力ディレクトリ** — 済
3. **ホスト例、README、publish 手順** — 済
4. **手動 E2E (dir) 記録** — 済 ([test-results.md](./test-results.md))
5. **npm 公開** — 済 (tag + `npm-publish` + dist-zip、`NPM_TOKEN`)
6. **Cozy Brew 配布向け Notice + About UI** — 済 (generate → Resources 同梱、About Window で License / Acknowledgements 表示確認。[test-results.md](./test-results.md) 2026-11-13に UI 行)
7. **status / test-results の整備** — 済 (2026-11-13)
8. **0.1.10** — 済 (Xcode `productName`、onot `company:` 例、Cozy Brew 検証記録)
9. **0.1.11** — 済 (`noticeProductName`、SPDX 見出し、generic WARN)

## 次のアクション (推奨)

| 優先 | 内容 |
| --- | --- |
| 低 | WordPress 等で `pipeline.noticeProductName` の記載例を examples に追加 (任意) |
| 低 | WordPress 実ホストで `wordpress` プリセット `generate` を [test-results.md](./test-results.md) に1行追記 |
| 低 | [implementation.md](./implementation.md) の P5-04等を latest **0.1.11** に表記同期 |
