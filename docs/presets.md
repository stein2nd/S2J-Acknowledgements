# S2J Acknowledgements - プリセット

ホスト種別ごとのデフォルトスキャン方針です。
[S2J Docs Linter](https://github.com/stein2nd/docs-linter) の `presets/swift` / `presets/wordpress` と同様、**パッケージ同梱** を正本とします。

## 一覧

| 名前 | 用途 | v1 |
| --- | --- | --- |
| `macos-app` | Xcode / XcodeGen の macOS アプリ (Cozy Brew 等) | **必須** |
| `wordpress` | WordPress プラグイン (Composer / npm 混在) | **推奨** |
| `dir` | 任意ディレクトリスキャン | **必須** |

## `macos-app`

### 目的

Release ビルド済み `.app` と、Swift Package Manager の checkouts などを組み合わせ、実行時・ビルド時依存を SBOM に反映します。

### ターゲット解決

[xcode-target-resolution.md](./xcode-target-resolution.md) に従い、スキャン対象 `.app` を決定します。

### スキャン (デフォルト)

| 設定 | 値 (`presets/macos-app/defaults.json`) |
| --- | --- |
| `scan.exclude` | `**/.github/**`、`**/.git/**`、`**/node_modules/**` (各 Syft `dir:` に `--exclude`) |
| `pipeline.noticeDenylist` | `actions/*`、`codecov/*`、`maxim-lobanov/*` (SPDX 前処理) |
| `pipeline.feluda` | `true` (配布用 Notice。未導入時は `doctor` が誘導) |

| `xcode.merge` 要素 | スキャン対象 |
| --- | --- |
| `app` | 解決された `*.app` バンドル |
| `spm-checkouts` | DerivedData 配下の `SourcePackages/checkouts` (プロジェクトに紐づくパス) |

### 出力デフォルト (Cozy Brew 例)

| 項目 | 値 (例) |
| --- | --- |
| `output` | `CozyBrewApp/Resources/ACKNOWLEDGEMENTS.md` |
| `xcode.scheme` | `CozyBrewApp` |
| `xcode.productName` | `CozyBrewApp.app` |

### 既知の制約

* `.app` のみの Syft スキャンではエントリーが少なすぎる場合がある → **マージ必須** とドキュメント化済み
* CI では `xcode.appPath` または `ACK_APP` の明示を推奨

## `wordpress`

### 目的

**配布物に含まれる** サードパーティーコンポーネントを SBOM に反映します。
典型例は `composer install` 後の **`vendor/`** (推移依存含む) と、同梱するビルド成果物・手動同梱ライブラリです。
`node_modules/` や `package.json` の開発依存は、ユーザーに渡らないため **デフォルトでは対象外** とします。

`composer.json` の `require` だけ、または `package.json` の `dependencies` / `devDependencies` 列挙だけでは、配布 zip の実体とずれたり、推移依存・各パッケージの LICENSE が漏れたりするため、**v1デフォルトには使いません**。
軽量化したい場合は、下記「Composer」の `composer.lock` を検討し、マニフェストのみモードは将来拡張または `scanPaths` 明示にとどめます。

### スキャン (デフォルト)

デフォルトの `scanPaths` (プリセット同梱 `defaults.json` 案): `[".", "vendor"]`。
ルート `.` スキャン時は `scan.exclude` で少なくとも `vendor/**`・`node_modules/**` を除外し、`vendor` は別パスとして1回だけスキャンします。

| 対象 | デフォルト | 備考 |
| --- | --- | --- |
| プラグインルート `.` | 含める | 同梱 JS/CSS、`assets/` 等。`vendor` / `node_modules` は重複スキャンを避けるため除外推奨 ([config-schema.md](./config-schema.md) の `scan.exclude`) |
| `vendor/` | **含める** | 配布 zip に載る PHP 依存の正本。各パッケージ内 LICENSE を Syft が拾う |
| `composer.lock` | **v1非対象** | `vendor/` スキャンを正とする。lock のみは v1.1候補 ([軽量オプション](#軽量オプション-composer)) |
| `node_modules/` | **含めない** | ビルド専用。同梱するなら `scanPaths` で明示 |
| `package.json` / `package-lock.json` | **列挙しない** | 埋め込み済み成果物は `.` 側で拾う想定。npm 全体を載せる場合のみ lock や `node_modules` を明示 |

### 軽量オプション (Composer)

`composer.json` の `require` のみを正本にする方式は、推移依存が配布物に含まれる場合に不十分なため **非推奨** です。

| 方式 | 向いている状況 |
| --- | --- |
| `dir:vendor` (デフォルト) | ローカル/CI で `composer install` 済み。配布物と一致させたい |
| `composer.lock` を Syft に渡す | **v1.1候補**。v1では未サポート ([decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md)) |

### npm / フロントエンド

| 項目 | 方針 |
| --- | --- |
| `devDependencies` | Acknowledgements には載せない (配布物に含まれない) |
| `dependencies` | 同上。ランタイムに npm パッケージを丸ごと同梱するまれな構成のみ `scanPaths` で対応 |
| ビルド成果物 | 多くはプラグインルートまたは `assets/`、`build/` 等 — デフォルトの `.` スキャン+除外でカバー |

### Feluda

PHP / Composer 主体ではライセンス穴が出やすいため、**`presets/wordpress/defaults.json` は `pipeline.feluda: true`** とします。`macos-app` も配布品質のため `true`。`dir` は `false`。
ホストの `ack.config.json` で上書き可能です。

### 出力

多くはプラグインルートの `ACKNOWLEDGEMENTS.md`。
配布 zip に同梱するかはホストのリリース手順に任せます。

## `dir`

### 目的

汎用リポジトリ向け。`scanPaths` で Syft に渡すディレクトリを列挙します。

### デフォルト

`scanPaths: ["./"]` — ホストが `vendor` / `node_modules` を含めるかは明示的に `scanPaths` で制御します。

## プリセットの適用順序

1. パッケージ内 `presets/<name>/defaults.json` (同梱・**機械可読の正本**)
2. ホストの `ack.config.json` で上書き (詳細は [domain.md](./domain.md) のマージ規則)

## パッケージレイアウト (予定)

```text
presets/
├── macos-app/
│   ├── defaults.json
│   └── onot.yaml.example
├── wordpress/
│   ├── defaults.json
│   └── onot.yaml.example
├── dir/
│   └── defaults.json
└── shared/
    └── onot.yaml.example   # dir 等のフォールバック
```

`onot.yaml.example` は各プリセット直下、または `presets/shared/` から **`init`** が未存在時のみ `onot.yaml` にコピーします (v1)。
