# S2J Acknowledgements - 命名

S2J シリーズにおける、本プロジェクトと npm パッケージの名前の決まりです。

## 決定事項

| レイヤ | 決定 |
| --- | --- |
| 表示名 | S2J Acknowledgements |
| GitHub リポジトリ名 | `S2J-Acknowledgements` (現行) / 公開時は `s2j-acknowledgements` への統一を検討可 |
| npm スコープ付きパッケージ名 | `@s2j/acknowledgements` |
| CLI コマンド名 (`bin`) | `s2j-acknowledgements` |
| README の Description | Generate Acknowledgements for third-party software, libraries, and tools used in your projects. |
| デフォルトの成果物ファイル名 | `ACKNOWLEDGEMENTS.md` (ホストが `--out` / 設定で変更可) |
| 開発用 `package.json` の name | 公開時は `@s2j/acknowledgements` と一致させる |

## 採用しなかった候補

| 候補 | 理由 |
| --- | --- |
| `@s2j/oss-notice` / `oss-notice-cli` | 「Notice」はサードパーティー表示全般に聞こえるが、本ツールの **出力名・画面ラベル** は Acknowledgements にそろえたい |
| `@s2j/third-party-notices` | 意味は明確だが CLI / スクリプト名が長い |
| `@s2j/software-credits` | Credits は謝意寄りで、ライセンス本文を含む成果物との対応が弱い |
| ライセンス管理 / コンプライアンス管理を名に含む表現 | **自プロジェクトのライセンス表示** と混同しやすい |

## 命名の根拠

### 「何を作るか」を名前にする

[S2J Docs Linter](https://github.com/stein2nd/docs-linter) が **Markdown 文書の lint** を担うように、本ツールは **Acknowledgements 文書の生成** を担います。
「何を管理するか」ではなく「何を出力するか」を前面に出します。

### S2J シリーズとの並び

| ツール | npm | CLI | 役割 |
| --- | --- | --- | --- |
| S2J Docs Linter | `@s2j/docs-linter` | `s2j-docs-linter` | ドキュメント lint |
| Acknowledgements (本ツール) | `@s2j/acknowledgements` | `s2j-acknowledgements` | Acknowledgements 生成 |

ホストの `package.json` では、下記のような **1行追加** を想定します。

```json
{
  "scripts": {
    "generate:acknowledgements": "s2j-acknowledgements generate --config ack.config.json",
    "ack:doctor": "s2j-acknowledgements doctor"
  },
  "devDependencies": {
    "@s2j/acknowledgements": "^0.1.0"
  }
}
```

スクリプト名はホストごとに `ack:generate` 等に寄せてもよいです。CLI 名は固定します。

## `package.json` への反映 (草案)

```json
{
  "name": "@s2j/acknowledgements",
  "description": "Generate Acknowledgements for third-party software, libraries, and tools used in your projects.",
  "type": "module",
  "bin": {
    "s2j-acknowledgements": "dist/bin/cli.js"
  },
  "files": [
    "dist/",
    "presets/",
    "schema/",
    "config/",
    "package.json",
    "README.md",
    "LICENSE"
  ]
}
```

## バージョン方針 (草案)

* 初回公開は **0.1.0** (CLI 骨格 + `init` + `macos-app` / `dir` 最小実装。**`wordpress` プリセットは v1 推奨**として `defaults.json` 同梱)。
* Syft / onot / Feluda のバージョンは npm の semver とは独立し、README と `doctor` の **推奨ピン** としてドキュメント化する (詳細は [install.md](./install.md))。
