# S2J Acknowledgements — 手動 E2E (onot あり)

リポジトリ自動テストでは onot / Syft を必須にしません。初回リリース前に **1回 green** を記録する手順です。

## 前提

* macOS または Linux、Node v22+
* `brew install syft` (または同等)
* Python v3.11+

## 手順

```zsh
cd /path/to/s2j-acknowledgements
npm ci
# prepare で dist ができるため、以降の npm run build は省略可

DIR="$(mktemp -d)"
cd "${DIR}"
cp "${OLDPWD}/test/fixtures/ack-dir.config.json" ack.config.json

node "${OLDPWD}/dist/bin/cli.js" init --preset dir --cwd .
node "${OLDPWD}/dist/bin/cli.js" doctor --config ack.config.json --cwd .
node "${OLDPWD}/dist/bin/cli.js" generate --config ack.config.json --cwd .
```

**期待:**

* `doctor` — syft / onot が OK (WARN のみなら exit `0`)
* `generate` — exit `0`、`build/oss-notice/ACKNOWLEDGEMENTS.test.md` (fixture の `output`) が **通常ファイル** として作成される (onot は `workDir/onot-notice/` に MD を書き、CLI がコピーする)

## 記録

成功したら [test-results.md](./test-results.md) に 1 行追記します (日付・環境・exit code・成果物パス)。本リポジトリは 2026-11-12 に `dir` で記録済みです。

**ホスト:** 手順のホストは **mktemp の一時ディレクトリ**であり、Cozy Brew 等の実リポジトリではありません。実アプリ統合は [usage.md](./usage.md) を参照します。
