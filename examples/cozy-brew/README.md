# S2J Cozy Brew — Acknowledgements 例

ホストリポジトリにコピーする `ack.config.json` のドラフトです。プロジェクト名、Scheme は実リポジトリに合わせて調整してください。

1. `npm install -D @s2j/acknowledgements`
2. 本 `ack.config.json` をリポジトリルートに
3. `npm run ack:init` (または `s2j-acknowledgements init --preset macos-app`)
4. Release ビルド後 `npm run ack:generate` (`--config ack.config.json`)
5. 生成された `ACKNOWLEDGEMENTS.md` をアプリに同梱

### スキャン除外、Notice denylist、Feluda

`macos-app` デフォルト (本 `ack.config.json`) では次を含みます ([pipeline.md](../../docs/pipeline.md)、[presets.md](../../docs/presets.md))。

* `scan.exclude`: `**/.github/**` 等 (Syft)
* `pipeline.noticeDenylist`: CI Action 名など配布物に含めない SPDX 行
* `pipeline.feluda: true`: マージ後 SBOM のライセンス補完

Feluda は [install.md](../../docs/install.md) のとおり PATH に用意し、`doctor` で Feluda 行が OK であることを確認してから `generate` します。Feluda だけに頼らず、除外と denylist も併用します。

`ack.config.feluda.example.json` は本例と同型の参考です。

`package.json.scripts.example` の `scripts` をホスト `package.json` にマージしてください。

詳細: [docs/usage.md](../../docs/usage.md)、[docs/xcode-target-resolution.md](../../docs/xcode-target-resolution.md)
