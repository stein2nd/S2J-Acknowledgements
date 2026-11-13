# S2J Acknowledgements - SPECS

確定前の仕様ドキュメントへの導線です。
[S2J Docs Linter](https://github.com/stein2nd/docs-linter) (`@s2j/docs-linter`) と同型の **薄い npm CLI オーケストレータ** として、サードパーティーソフトウェア向け **Acknowledgements** を生成するための草案です。

## シリーズ位置付け

| 項目 | 内容 |
| --- | --- |
| シリーズ | S2J (Stein2nd Japan tooling) |
| 本プロジェクト | S2J Acknowledgements (`S2J-Acknowledgements`) |
| npm パッケージ | `@s2j/acknowledgements` |
| CLI コマンド | `s2j-acknowledgements` |
| 姉妹プロジェクト | [S2J Docs Linter](https://github.com/stein2nd/docs-linter) (`@s2j/docs-linter` / `s2j-docs-linter`) |
| アプリケーション類型 | **CLUI ユーティリティ** (薄いオーケストレーション層) |
| 主な成果物 | ホスト側が指定する `ACKNOWLEDGEMENTS.md` (初期は Markdown のみ) |

## ドメインの境界

本ツールが担うのは **サードパーティーのソフトウェア・ライブラリ・ツール** についての Acknowledgements 生成です。

SBOM に載るコンポーネントは、必ずしも実行時依存だけではありません。開発専用ツールやビルド時依存を含めるかは、プリセットとスキャン対象でホスト側が決めます。

| 対象 | 例 | 本ツール |
| --- | --- | --- |
| Third-Party Software | 依存ライブラリ、ビルドツール、参照 OSS | **対象** |
| Acknowledgements 成果物 | `ACKNOWLEDGEMENTS.md` | **生成** |
| Application License | GPL-3.0-or-later 等、自アプリのライセンス表示 | **非対象** |

## 設計方針 (要約)

詳細は各専門仕様を正本とします。

| 方針 | 内容 |
| --- | --- |
| 実装 | **TypeScript + `tsc` (v1)** → `dist/bin/cli.js`。Vite は必要時のみ ([layout.md](./layout.md)) |
| 外部ツール | Syft / onot / Feluda は **npm に同梱しない**。子プロセスで呼ぶ |
| パイプライン | 成果物特定 → Syft (SPDX JSON) → (任意) Feluda → onot (Notice) → 出力コピー |
| プラットフォーム | 初期は **macOS / Linux** 想定。**Windows は v1スコープ外** |
| onot | PyPI 前提。**`init` がホストに `./venv/` を作成** して pip インストール。`doctor` / `generate` は venv 内 `onot` を優先 |
| 命名 | 成果物名に合わせ **Acknowledgements** (OSS コンプライアンス管理ツールではない) |

## 仕様正本マトリックス

矛盾時は下表の「正本」を更新し、他ファイルは追随させます。[decisions/002-canonical-sources.md](./decisions/002-canonical-sources.md)

| トピック | 正本 | 他ファイルの役割 |
| --- | --- | --- |
| CLI 契約 (`init` / `doctor` / `generate`) | [cli.md](./cli.md) | 要約・例のみ |
| 設定フィールド | [config-schema.md](./config-schema.md) + `schema/ack.config.schema.json` | JSON 例 |
| Syft / マージ / 成果物コピー | [pipeline.md](./pipeline.md) | 概念リンク |
| プリセットデフォルト値 | [presets.md](./presets.md) + `presets/<name>/defaults.json` | config 例は同期 |
| 外部ツール、venv | [install.md](./install.md) + `config/recommended-tools.json` | `doctor` メッセージ |
| Xcode `.app` 解決 | [xcode-target-resolution.md](./xcode-target-resolution.md) | — |
| 設計決定ログ | [decisions/](./decisions/) | ADR 参照 |

## ドキュメント命名規則

* **ファイル名:** ASCII のみ (英数字、ハイフン)。日本語やスペースは使わない。
* **タイトル:** 各ファイルの1行目に `# S2J Acknowledgements - …` 形式で記載する。

## 仕様書一覧

| ファイル | 概要 |
| --- | --- |
| [naming.md](./naming.md) | GitHub / npm / CLI / 成果物ファイル名の決定 |
| [domain.md](./domain.md) | ドメイン境界、用語、非責務 |
| [pipeline.md](./pipeline.md) | Syft / Feluda / onot の直列パイプライン |
| [cli.md](./cli.md) | サブコマンド、`init` / `doctor` / `generate`、exit code |
| [decisions/](./decisions/) | ADR (venv、正本、Syft マージ等) |
| [config-schema.md](./config-schema.md) | `ack.config.json` と共有 `onot.yaml` |
| [presets.md](./presets.md) | `macos-app` / `wordpress` / `dir` |
| [xcode-target-resolution.md](./xcode-target-resolution.md) | Release `.app` の解決順序 |
| [install.md](./install.md) | 外部ツールの前提インストール |
| [usage.md](./usage.md) | ホストプロジェクトからの呼び出し |
| [layout.md](./layout.md) | リポジトリ構成、`bin`、プリセット配置 |
| [implementation.md](./implementation.md) | v1実装タスク一覧 |
| [status.md](./status.md) | 進行状況の集計 |
| [e2e.md](./e2e.md) | 手動 E2E (Syft + onot) 手順 |
| [test-results.md](./test-results.md) | 手動 E2E / ホスト smoke の記録 |
| [publish.md](./publish.md) | npm 公開チェックリスト |

## 参照ユースケース

| ホスト | 目的 |
| --- | --- |
| [S2J Cozy Brew](https://github.com/stein2nd/s2j-cozy-brew) | About 画面から Acknowledgements を表示するため、ビルド時に MD を同梱 |
| WordPress プラグイン (v1 **推奨** プリセット) | プラグイン配布物に `ACKNOWLEDGEMENTS.md` を含める |

## 進行管理

| 種別 | 場所 |
| --- | --- |
| **公開正本** | [docs/](./) (本ディレクトリ) |
| 草案スナップショット | [docs_mod/](../docs_mod/) (削除しない。参照用) |

### 仕様書のライフサイクル

1. **草案:** `docs_mod/` で記述 (2026-11-12〜 確定まで)。
2. **確定:** 必要に応じ既存 `docs/*.md` を `docs/archive/` に退避する。
3. **公開正本:** 確定版を **`docs/`** に配置 (**完了:** 2026-11-12)。

## ステータス

**正本:** 2026-11-12確定。`docs_mod/` は同日スナップショットを保持。
