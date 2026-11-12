# S2J Acknowledgements

Third-party software, libraries, and tools 向け **Acknowledgements** (`ACKNOWLEDGEMENTS.md` 等) を生成する npm CLI です。

## クイックスタート (ホストプロジェクト)

**前提:** Node.js v22+、[Syft](https://github.com/anchore/syft) (別途インストール)、macOS/Linux。

```zsh
npm install -D @s2j/acknowledgements
npx s2j-acknowledgements init --preset dir
# preset: macos-app | wordpress | dir
brew install syft   # 未導入の場合
npx s2j-acknowledgements doctor --config ack.config.json
npx s2j-acknowledgements generate --config ack.config.json --dry-run
npx s2j-acknowledgements generate --config ack.config.json
```

`init` は `ack.config.json`・`onot.yaml`・ホストルートの `./venv/` (onot 用) を冪等に用意します。詳細は [docs/usage.md](./docs/usage.md)。

### よく使う scripts

```json
{
  "scripts": {
    "ack:doctor": "s2j-acknowledgements doctor --config ack.config.json",
    "ack:generate": "s2j-acknowledgements generate --config ack.config.json"
  }
}
```

ホスト別の例: [examples/cozy-brew](./examples/cozy-brew/) (macOS アプリ)、[examples/wordpress-plugin](./examples/wordpress-plugin/)。

## ドキュメント

| 文書 | 内容 |
| --- | --- |
| [docs/specs.md](./docs/specs.md) | 仕様索引 (正本) |
| [docs/usage.md](./docs/usage.md) | ワークフロー |
| [docs/status.md](./docs/status.md) | 実装進捗 |
| [docs/test-results.md](./docs/test-results.md) | 手動 E2E 記録 |
| [docs/implementation.md](./docs/implementation.md) | タスク ID |

## 開発 (本リポジトリ)

```zsh
npm install
npm run lint
npm run test
npm run test:doctor
npm run build
npm run dist
```

npm 公開手順: [docs/publish.md](./docs/publish.md)。
