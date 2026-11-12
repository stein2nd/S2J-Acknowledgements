# S2J Acknowledgements — npm 公開手順

v1 初回公開のチェックリストです。

## 前提

* `npm run lint` / `npm run test` / `npm run test:doctor` が green
* 手動 E2E ([e2e.md](./e2e.md)) が [test-results.md](./test-results.md) に記録済み
* [CHANGELOG.md](../CHANGELOG.md) にバージョン節を記載
* `package.json` の `version` と git tag を一致させる

## private → public

1. npm で `@s2j/acknowledgements` スコープを用意 (org が未作成なら npm に組織登録)
2. ローカルで `npm publish --access public --dry-run` を実行し `files` フィールドを確認
3. `git tag v0.1.0` (例) → push → [dist-zip workflow](../.github/workflows/dist-zip.yml) がタグで動作することを確認
4. `npm publish --access public`

## 同梱物

`package.json` の `files` に含まれるもの:

* `dist/`、`presets/`、`schema/`、`config/`、`README.md`、`LICENSE`

ホスト向けの設定例はリポジトリ内 `examples/` (npm tarball には含めない)。

## 公開後

* ホスト (Cozy Brew 等) で `npm install -D @s2j/acknowledgements@<version>` をピン
* [examples/cozy-brew](../examples/cozy-brew/) / [examples/wordpress-plugin](../examples/wordpress-plugin/) を参照して `ack.config.json` を配置
