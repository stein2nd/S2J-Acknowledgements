# S2J Acknowledgements - 設定スキーマ

ホストプロジェクトが置く **`ack.config.json`** と、onot 用 **YAML** の草案です。
v1では JSON Schema ファイル (`schema/ack.config.schema.json`) の同梱を想定します。

## `ack.config.json` (最小例)

`init` が作成する **`./venv/`** を `generate` / `doctor` が onot 解決に使います。変更する場合のみ `tools.venvPath` を指定します。

```json
{
  "preset": "macos-app",
  "xcode": {
    "project": "CozyBrew.xcodeproj",
    "scheme": "CozyBrewApp",
    "configuration": "Release"
  },
  "pipeline": {
    "feluda": false,
    "onotFormat": "md",
    "onotConfig": "onot.yaml"
  },
  "output": "CozyBrewApp/Resources/ACKNOWLEDGEMENTS.md",
  "workDir": "build/oss-notice",
  "tools": {
    "venvPath": "venv"
  }
}
```

## フィールド一覧

未知キーは v1では **警告** を出し無視します (前方互換)。

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `preset` | string | 推奨 | `macos-app` / `wordpress` / `dir` ([presets.md](./presets.md)) |
| `output` | string | **はい** | 最終成果物パス (ホストルート相対) |
| `workDir` | string | いいえ | 中間ファイル (デフォルト `build/oss-notice`) |
| `scanPaths` | string[] | いいえ | Syft に渡すパス列。未指定時はプリセットデフォルト (`wordpress`: `[".", "vendor"]` — [presets.md](./presets.md)) |
| `scan` | object | いいえ | スキャン補助 (`wordpress` で `exclude` を推奨) |
| `scan.exclude` | string[] | いいえ | Syft 除外パターン。`wordpress` デフォルト案は下記 WordPress 例 |
| `xcode` | object | 条件付き | `preset: macos-app` で使用 |
| `xcode.project` | string | いいえ | `*.xcodeproj` ファイル名 |
| `xcode.scheme` | string | 推奨 | `xcodebuild -scheme` |
| `xcode.configuration` | string | いいえ | デフォルト `Release` |
| `xcode.appPath` | string | いいえ | `.app` 明示 (CI)。設定時は自動探索より優先 |
| `xcode.productName` | string | いいえ | DerivedData / `xcodebuild` 解決の `.app` 名 (`CozyBrewApp.app`)。`pipeline.noticeProductName` 未設定時、SPDX ドキュメント名 (onot 見出し) は `.app` を除いた値 |
| `xcode.merge` | string[] | いいえ | デフォルト `["app", "spm-checkouts"]` (`macos-app`) |
| `pipeline` | object | いいえ | パイプライン制御 |
| `pipeline.feluda` | boolean | いいえ | プリセットデフォルト: `macos-app` / `wordpress` `true`、`dir` `false` |
| `pipeline.feludaArgs` | string[] | いいえ | Feluda 引数。`{sbom}` はマージ後 SBOM パス。未指定時は `--sbom-input` / `--sbom-enriched` |
| `pipeline.noticeProductName` | string | いいえ | 全プリセット共通の製品名 (SPDX `name` / onot 見出し `OSS Notice for …`)。**最優先**。未設定かつ macOS 以外は `host-sbom` になり `doctor` / `generate` が WARN |
| `pipeline.noticeDenylist` | string[] | いいえ | Notice から省く SPDX `packages[].name` glob (`actions/*` 等)。[pipeline.md](./pipeline.md) |
| `pipeline.onotFormat` | string | いいえ | v1は `md` のみ |
| `pipeline.onotConfig` | string | いいえ | onot 設定 YAML へのパス |
| `syft` | object | いいえ | Syft 追加引数 (上級者向け) |
| `syft.extraArgs` | string[] | いいえ | 例: 除外フラグ |
| `tools` | object | いいえ | 外部ツールのパス解決 |
| `tools.venvPath` | string | いいえ | ホストルート相対。デフォルト `venv` (`init` が作成) |
| `tools.onotPath` | string | いいえ | onot 実行ファイルを明示 (通常は `{venvPath}/bin/onot` を自動使用) |

## WordPress プリセット例

`scan.exclude` は Syft に渡す除外パターンの抽象フィールドです。実フラグへのマッピングは、実装時に [presets.md](./presets.md) と同期します。

* **`scanPaths`**: 配布物に載る **`vendor/`** と、同梱ファイル用の **ルート `.`**。`composer.json` の `require` だけや `package.json` の依存列挙はデフォルトにしません (推移依存、LICENSE 取りこぼしのため)。
* **`scan.exclude`**: ルート `.` スキャン時に `vendor` / `node_modules` を二重計上しないための除外。キャッシュ等もここに足します。
* **`node_modules`**: デフォルトでは `scanPaths` に含めません。同梱・監査が必要なときだけ明示します。

```json
{
  "preset": "wordpress",
  "scanPaths": [".", "vendor"],
  "scan": {
    "exclude": [
      "vendor/**",
      "node_modules/**",
      "node_modules/.cache/**",
      ".git/**"
    ]
  },
  "pipeline": {
    "feluda": true,
    "onotFormat": "md",
    "onotConfig": "onot.yaml"
  },
  "output": "ACKNOWLEDGEMENTS.md",
  "workDir": "build/oss-notice",
  "tools": { "venvPath": "venv" }
}
```

### WordPress と `composer.lock` (v1)

`composer.lock` のみを Syft 入力にする例は **v1では非サポート** です。[presets.md](./presets.md) / [decisions/003-spdx-merge-and-syft.md](./decisions/003-spdx-merge-and-syft.md)。v1では上記 `vendor/` 付き例を正とします。

## ディレクトリのみ (`dir`)

```json
{
  "preset": "dir",
  "scanPaths": ["."],
  "output": "ACKNOWLEDGEMENTS.md",
  "workDir": "build/oss-notice",
  "pipeline": {
    "onotConfig": "onot.yaml"
  }
}
```

## onot 設定 YAML

### 配置

| 方式 | 説明 |
| --- | --- |
| ホストプロジェクト直下 | `onot.yaml` を `pipeline.onotConfig` で指定 |
| プリセット同梱 | `presets/.../onot.yaml.example` をコピー元として **`init`** がホストに生成 (`onot.yaml` 未存在時のみ) |

### 内容 (概念)

**Notice テンプレートのメタデータ** を記述します (onot **1.2.x** は `company:` 配下)。
サードパーティーパッケージのライセンス本文そのものは SBOM / onot が解決します。

```yaml
company:
  organization: "Your Org"
  copyright_holder: "Your Org"
  copyright_year: 2026
  contact_email: "you@example.com"
  source_download_url: "https://github.com/you/repo"
```

トップレベルの `organization` 等は onot v1.2では **拒否** されます (`extra_forbidden`)。CLI `--help` のフラット列挙は `company` ネストと同義です。ひな型: [presets/shared/onot.yaml.example](../presets/shared/onot.yaml.example)。

## 環境変数 (オプション)

CLI 引数より優先度は低くします (CI でのオーバーライト用)。

| 変数 | 効果 |
| --- | --- |
| `ACK_APP` | `xcode.appPath` と同等 |
| `ACK_CONFIG` | デフォルト config パス |
| `ACK_WORK_DIR` | `workDir` オーバーライト |

`doctor` のフルモードは `ACK_CONFIG` または `--config` を参照します ([cli.md](./cli.md))。

## バリデーション

* `output` が空、または親ディレクトリが作成不能 → exit `2`
* `preset` 未知 → exit `2`
* `pipeline.onotFormat` が `md` 以外 (v1) → exit `2`
