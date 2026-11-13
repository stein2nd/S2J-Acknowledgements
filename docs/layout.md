# S2J Acknowledgements - リポジトリ構成

Vite + TypeScript で CLI をビルドするリポジトリレイアウトの草案です。
[S2J Docs Linter](https://github.com/stein2nd/docs-linter) の製造ラインにそろえます。

## ディレクトリ (目標)

```text
S2J-Acknowledgements/
├── src/
│   ├── bin/
│   │   └── cli.ts          # shebang 付きエントリ
│   ├── application/        # generate, doctor ユースケース
│   ├── domain/             # 設定マージ、解決ロジックの純関数
│   └── adapters/           # spawn, fs, xcodebuild, yaml
├── presets/
│   ├── macos-app/
│   ├── wordpress/
│   └── dir/
├── schema/
│   └── ack.config.schema.json
├── dist/                   # ビルド成果 (npm files に含める)
│   └── bin/
│       └── cli.js
├── docs/                   # 公開正本仕様
├── docs_mod/               # 草案スナップショット (保持、編集は docs/ に)
├── scripts/                # test-doctor.sh 等
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── vite.config.ts          # または tsc のみ (docs-linter は tsc 主体)
```

## ビルド

| 項目 | 方針 |
| --- | --- |
| ビルド | **Vite** (SSR bundle、`src/bin/cli.ts` → `dist/bin/cli.js`) |
| ソース | TypeScript (`module`) |
| 成果物 | `dist/bin/cli.js` |
| `bin` | `"s2j-acknowledgements": "dist/bin/cli.js"` |
| `prepare` | `npm run build` (publish 時) |
| 配布 zip | `npm run dist` → `release/s2j-acknowledgements-<version>.zip` ([.github/workflows/dist-zip.yml](../.github/workflows/dist-zip.yml)) |

## npm `files`

```json
[
  "dist/",
  "presets/",
  "schema/",
  "config/",
  "package.json",
  "README.md",
  "LICENSE"
]
```

## `engines`

開発依存の `@s2j/docs-linter` は `>=20` ですが、Node v20は2026-04に EOL、GitHub Actions の Action ランタイムからも2026-09に Node v20が除外されています。

ホスト向け初期案:

```json
{
  "node": ">=22"
}
```

## 開発用 scripts (草案)

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch",
    "test:doctor": "node dist/bin/cli.js doctor",
    "lint:docs": "s2j-docs-linter ./README.md ./CHANGELOG.md ./docs/**/*.md"
  }
}
```

## ホストプロジェクトレイアウト (`init` 後)

本パッケージが **ホスト側** に追加する標準配置です (ホストのアプリ用 `.venv` とは別名)。

```text
host-project/
├── ack.config.json       # init
├── onot.yaml             # init (任意)
├── venv/                 # init — onot 入り Python venv (Git 除外)
├── build/oss-notice/     # generate の中間 SBOM (Git 除外推奨)
└── ACKNOWLEDGEMENTS.md   # generate 成果物 (多くは commit)
```

`venv/` は [install.md](./install.md) / [usage.md](./usage.md) の `.gitignore` 案内の正本です。

## テスト方針 (草案)

| 層 | 手法 |
| --- | --- |
| domain | 純関数のユニットテスト (Vitest 等) |
| adapters | モック spawn / fixture パス |
| E2E | 外部ツール有無でスキップ可能な integration (`test:doctor`) |

フル E2E (Syft + onot 必須) は CI の optional job とします。

## ドキュメント

| 場所 | 役割 |
| --- | --- |
| `docs/` | 公開の正本仕様 (現行) |
| `docs_mod/` | 確定に移行時のスナップショット |
| `README.md` | クイックスタート + `docs/` へのリンク |

## ライセンス

リポジトリ `LICENSE` に従います (現行 GPL-3.0-or-later)。
生成される Acknowledgements の内容は **サードパーティーライセンス**であり、本ツールのライセンスとは別です。
