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
4. `npm publish --access public` (2FA)**または** 下記「ステージ公開」

## ステージ公開と `0.0.0-stage`

npm が [Staged publishing](https://docs.npmjs.com/staged-publishing/) を使うと、**新規パッケージ名だけ**が先に公開され、README は *Temporary Holding Version*、`latest` は **`0.0.0-stage`** になります。中身はプレースホルダーで、**実バージョン (例: 0.1.0) は承認まで registry に載りません**。

| 見え方 | 意味 |
| --- | --- |
| npm ページがほぼ空・`0.0.0-stage` | 名前確保用。正常 (初回のよくある状態) |
| `npm view @s2j/acknowledgements` が 404 / Not found | 本番 tarball は未承認の可能性大 |
| リポジトリの `0.1.0` | ローカル/Git の正。npm と一致させるには承認または `npm publish` |

### 承認手順 (ステージ済みのとき)

npm CLI **11.15+**、Node **22.14+** 推奨。

```zsh
npm login
npm stage list @s2j/acknowledgements
npm stage view <stage-id>          # メタデータ確認
npm stage download <stage-id>      # tarball をローカル検査 (任意)
npm pack --dry-run                 # リポジトリ側の files 一覧と突合
npm stage approve <stage-id>       # 2FA。承認後に0.1.0等が公開される
```

npmjs.com: アカウント → **Staged Packages** から同じ承認ができます。

承認後の確認:

```zsh
npm view @s2j/acknowledgements version
npm view @s2j/acknowledgements dist-tags
```

ステージを使わず **直接** 公開する場合は、承認待ちのステージとバージョンが衝突しないよう `npm stage list` で確認してから `npm publish --access public` してください。

## 同梱物

`package.json` の `files` に含まれるもの:

* `dist/`、`presets/`、`schema/`、`config/`、`README.md`、`LICENSE`

ホスト向けの設定例はリポジトリ内 `examples/` (npm tarball には含めない)。

## 公開後

* ホスト (Cozy Brew 等) で `npm install -D @s2j/acknowledgements@<version>` をピン
* [examples/cozy-brew](../examples/cozy-brew/) / [examples/wordpress-plugin](../examples/wordpress-plugin/) を参照して `ack.config.json` を配置
