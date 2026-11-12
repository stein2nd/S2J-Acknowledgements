# S2J Acknowledgements - 外部ツールのインストール

本 npm パッケージは **Syft / Feluda / onot を同梱しません**。
README と `doctor` が、下記の前提を案内します。

## 一覧

厳密には、「すべて `brew install`」は **Syft のみ** と言えます。
onot は brew 公式 formula 未定義を前提とします。

| ツール | 役割 | v1必須 | 推奨インストール |
| --- | --- | --- | --- |
| Node.js | CLI 本体 | はい | **v22 `LTS` 以上** を推奨 (`engines.node` は [layout.md](./layout.md)) |
| Syft | SBOM / SPDX | はい | Homebrew |
| onot | Notice 生成 | はい | **`init` がホストに `./venv/` を作り pip でインストール** (標準)。代替: pipx 等は上級者向け |
| Feluda | 補完・監査 | いいえ | 配布元 README に従う |

## Node.js と GitHub Actions

混同しやすい点が2つあります。

| 種別 | 何の Node か | v1方針 |
| --- | --- | --- |
| **Actions 上の JavaScript Action 実行ランタイム** | `action.yml` の `runs.using: node20` 等で指定される、Action 本体を動かす Node | Node v20は2025年から段階的に非推奨。**2026-09-23以降は Node v24のみ** ([GitHub Changelog](https://github.blog/changelog/2026-09-23-node-20-is-no-longer-available-in-github-actions/))。利用・保守する Action は `node24` 対応版に更新する |
| **ワークフロー内のプロジェクト用 Node** | `actions/setup-node` で入れる、テスト・`npm run` 用の Node | 本 CLI の `engines` に合わせる。**Node v20は2026-04に EOL のため新規、CI とも v22 `LTS` 以上を推奨** |

本ツールは **TypeScript CLI** です。GitHub Actions でホストの `ack:generate` を回すときは、たとえば `setup-node` で **v22または v24** を指定し、サードパーティ Action は Node v24対応のタグ/SHA にそろえます。Node v20を `setup-node` に固定したままにしても、**Action ランタイム廃止**とは別問題ですが、EOL ランタイムでの CI は避けてください。

## Syft

推奨バージョンは `doctor` 出力と `docs/` (将来) にメタ記載します。実装の開始時点の Syft をピン留めし、破壊的な変更時にドキュメント更新します。

```zsh
brew install syft
syft version
```

## onot

### 標準: ホストの `./venv/` (`init`)

Python **3.11以上** の `python3` が PATH にあることが前提です。

```zsh
npm install -D @s2j/acknowledgements
s2j-acknowledgements init --preset macos-app   # 例
s2j-acknowledgements doctor
```

`init` はホストルートに **`./venv/`** を作成し、[config/recommended-tools.json](../config/recommended-tools.json) に従い **onot と openpyxl を常にピン留め** で入れます。

```text
pip install 'onot[spdx,cyclonedx]==1.2.0' openpyxl
```

`generate` / `doctor` は **`./venv/bin/onot`** を優先して呼びます ([cli.md](./cli.md))。`npm install` だけでは venv は作られません。

### `.gitignore`

`venv/` は Git に含めません。`init` は次を行います。

* ホストに **`.gitignore` がない**: 推奨内容を案内。`--write-gitignore` で最小ファイルを **新規作成** 可能 ([cli.md](./cli.md))
* **すでに `.gitignore` がある**: 自動追記しない。`venv/` / `build/oss-notice/` がなければ WARN

### 代替: pipx (グローバル)

チーム方針で venv を置きたくない場合のみ。`doctor` は PATH 上の `onot` にフォールバックします。

```zsh
brew install pipx
pipx ensurepath
pipx install 'onot[spdx,cyclonedx]==1.2.0'
pipx inject onot openpyxl
```

### Cozy Brew との関係

アプリ本体制作用の **既存 `.venv`** と、Acknowledgements 用の **`./venv/`** は **別ディレクトリ** として共存させます。本ツールはアプリ用 venv を有効化しません。

### 将来

* 上流への Homebrew formula 要望
* `init --repair-venv` (pip 再同期)

## Feluda

インストール経路は固定しません (cargo、GitHub Releases 等)。

```zsh
# 例 (環境により異なる)
which feluda && feluda --version
```

`pipeline.feluda: true` のホストのみ、`doctor` で必須扱いにします。

## 本ツール本体

```zsh
npm install -D @s2j/acknowledgements
npx s2j-acknowledgements doctor
```

## インストールしないこと (v1)

WordPress プラグイン CI 向けの **任意 Docker イメージ** (`syft` + `onot` + `feluda`) は将来 initiative とします。

| 手段 | 理由 |
| --- | --- |
| `postinstall` で venv / pipx / brew 実行 | 権限、再現性、CI で壊れやすい。**venv は `init` のみ** |
| npm dependency に Syft バイナリ同梱 | プラットフォーム別バイナリ管理が別製品級 |
| Docker 必須 (ローカル) | macOS アプリ開発者の摩擦が大きい |

## バージョンピン

正本はリポジトリ直下の **[config/recommended-tools.json](../config/recommended-tools.json)** です。`init` の pip と `doctor` の WARN がこれに従います。

厳密な semver 縛りは `doctor` では **WARN** とし、メジャー不一致のみ **ERROR** とする案を v1デフォルトにします (詳細は実装で調整)。

## Windows

v1ではサポート対象外です。`doctor` は非 macOS で一部チェックをスキップし、パス解決は `dir` / `wordpress` のみを想定します。
