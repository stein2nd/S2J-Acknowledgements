# S2J Cozy Brew — Acknowledgements 例

ホストリポジトリにコピーする `ack.config.json` のドラフトです。プロジェクト名、Scheme は実リポジトリに合わせて調整してください。

1. `npm install -D @s2j/acknowledgements`
2. 本 `ack.config.json` をリポジトリルートに
3. `npm run ack:init` (または `s2j-acknowledgements init --preset macos-app`)
4. Release ビルド後 `npm run ack:generate` (`--config ack.config.json`)
5. 生成された `ACKNOWLEDGEMENTS.md` をアプリに同梱

### SPDX 前処理と Feluda (任意)

パイプラインは Syft マージ後に **パス匿名化** と **パス型 package 行の除去** を行ってから onot に渡します ([pipeline.md](../../docs/pipeline.md))。

ライセンス補完が必要なときは [install.md](../../docs/install.md) のとおり Feluda を PATH に入れ、`ack.config.feluda.example.json` を参考に `pipeline.feluda: true` を設定してください。`doctor` で Feluda 行が OK であることを確認してから `generate` します。

`package.json.scripts.example` の `scripts` をホスト `package.json` にマージしてください。

詳細: [docs/usage.md](../../docs/usage.md)、[docs/xcode-target-resolution.md](../../docs/xcode-target-resolution.md)
