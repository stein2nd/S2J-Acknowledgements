# S2J Acknowledgements - 実装タスク

v1向けの実装 initiative タスクです。状態は [status.md](./status.md) で集計します。

## v1着手前の確定事項 (Must decide → 決定済み)

| 項目 | 決定 | 参照 |
| --- | --- | --- |
| ホスト venv / `init` 冪等 | 採用 | [decisions/001-venv-and-init.md](./decisions/001-venv-and-init.md) |
| 仕様正本 | マトリックス + 機械可読 | [decisions/002-canonical-sources.md](./decisions/002-canonical-sources.md)、[specs.md](./specs.md) |
| SPDX マージ / Syft exclude | 2+ 対象でマージ | [decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md)、[pipeline.md](./pipeline.md) |
| Feluda 既定 | `wordpress` のみ `true` | `presets/wordpress/defaults.json` |
| `composer.lock` のみ | v1非対象 | ADR 003 |

## 非目的

本ファイルは仕様本文の重複コピーを持ちません。各節の正本は `docs/*.md` です。

## フェーズ0: リポジトリ骨格

| ID | タスク | 状態 |
| --- | --- | --- |
| P0-01 | `package.json` ひな型 (`@s2j/acknowledgements`, `bin`, `engines`) | **完了** |
| P0-02 | TypeScript ビルド (Vite) と `dist/bin/cli.js` | **完了** |
| P0-03 | CLI エントリ (`--help`, サブコマンドルーティング) | **完了** |
| P0-04 | `presets/` と `defaults.json` (3プリセット + `shared/onot.yaml.example`) | **完了** |
| P0-05 | `config/recommended-tools.json` 同梱、`doctor` 参照 | **完了** |
| P0-06 | `schema/ack.config.schema.json` 同梱 | **完了** |
| P0-07 | ESLint / Prettier / Vitest、`npm run lint` / `test` | **完了** |
| P0-08 | `.github/workflows/dist-zip.yml`、`npm run dist` → `release/*.zip` | **完了** |

## フェーズ1: doctor

| ID | タスク | 状態 |
| --- | --- | --- |
| P1-01 | `which` + バージョン取得 (syft, onot) | **完了** (推奨版 semver の WARN は簡易) |
| P1-02 | Python v3.11+ 検出 | **完了** |
| P1-03 | Feluda 任意チェック | **完了** (`--config` / `ACK_CONFIG` あり時) |
| P1-04 | exit code 契約 ([cli.md](./cli.md)) | **完了** (`scripts/test-doctor.sh` ACK-001〜006) |
| P1-05 | `scripts/test-doctor.sh` (docs-linter 同型) | **完了** (CI dist-zip に組込み) |
| P1-06 | `.gitignore` 行判定 ([cli.md](./cli.md)) | **完了** |

## フェーズ2: 設定、プリセット、`init`

| ID | タスク | 状態 |
| --- | --- | --- |
| P2-01 | `ack.config.json` 読み込みとバリデーション | **完了** (マージ後 Ajv + `schema/ack.config.schema.json`) |
| P2-02 | プリセットマージ (`presets/<name>/defaults.json`) | **完了** (`doctor` で使用) |
| P2-03 | `schema/ack.config.schema.json` 同梱 | **完了** |
| P2-04 | `init`: 設定・`onot.yaml` ひな型、`python3 -m venv ./venv`、onot pip ピン | **完了** |
| P2-05 | `init`: `.gitignore` 案内・`--write-gitignore`・既存時 WARN | **完了** |
| P2-06 | onot 解決 (`venv/bin/onot` 優先) を generate / doctor で共有 | **完了** |

## フェーズ3: ターゲット解決

| ID | タスク | 状態 |
| --- | --- | --- |
| P3-01 | 明示 `appPath` / `ACK_APP` | **完了** (`generate --app` / 設定 / env → `resolveMacAppPath`) |
| P3-02 | `xcodebuild -showBuildSettings` アダプタ | **完了** (`xcode.project` + `scheme` 時。`BUILT_PRODUCTS_DIR` 結合) |
| P3-03 | DerivedData glob + productName / mtime | **完了** (`<token>-*` 配下 `Build/Products/<configuration>`) |
| P3-04 | SPM `SourcePackages/checkouts` パス解決 | **完了** (`.app` 解決後の DerivedData 優先、`.build/checkouts` フォールバック) |
| P3-05 | `project.yml` 読み取り (任意) | **完了** (`name:` ベストエフォート、yaml 依存なし) |

## フェーズ4: パイプライン

| ID | タスク | 状態 |
| --- | --- | --- |
| P4-01 | Syft 呼び出し (SPDX JSON) | **完了** |
| P4-02 | SPDX マージ (Syft 対象2+ 汎用、[pipeline.md](./pipeline.md)) | **完了** |
| P4-03 | Feluda オプション呼び出し | **完了** (`--sbom-input` / `--sbom-enriched`、`pipeline.feludaArgs`) |
| P4-04 | onot 呼び出し (md 出力) | **完了** (`-o {workDir}/onot-notice/`、`OSS_Notice_*.md` → `output`) |
| P4-05 | 成果物コピーと `workDir` 清理 | **完了** (`output` 内外で削除ポリシー分岐) |
| P4-06 | `--dry-run`, `--verbose`, `--keep-intermediate` | **完了** |

## フェーズ5: ホスト統合

| ID | タスク | 状態 |
| --- | --- | --- |
| P5-01 | [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) 用 `ack.config.json` 例 | **完了** (`examples/cozy-brew/`) |
| P5-02 | Cozy Brew `package.json` に `ack:*` scripts | **完了** (`package.json.scripts.example`) |
| P5-03 | WordPress プリセット README 例 | **完了** (`examples/wordpress-plugin/`) |
| P5-04 | npm 公開手順 (private → public) | **完了** (`@s2j/acknowledgements@0.1.0`) |

## フェーズ6: ドキュメント移行

| ID | タスク | 状態 |
| --- | --- | --- |
| P6-01 | `docs_mod/` 確定版を `docs/` に移行 | **完了** |
| P6-02 | README クイックスタート | **完了** |
| P6-03 | CHANGELOG 初回リリース記載 | **完了** (`0.1.0` / `v0.1.0`) |

## 将来 (v1スコープ外)

| 項目 | 備考 |
| --- | --- |
| `init --repair-venv` | pip 再同期、破損 venv の修復 |
| 既存 `.gitignore` への安全な追記 | v1は案内のみ |
| Windows ターゲット解決 | `dir` / `wordpress` のみ先行 |
| TS サブセット Notice ジェネレータ | onot 代替 |
| Docker CI イメージ | WP 向け |
| HTML / PDF 出力 | onot 委譲 |
