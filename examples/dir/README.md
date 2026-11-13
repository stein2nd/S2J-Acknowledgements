# dir プリセット — Acknowledgements 例

任意ディレクトリ (リポジトリルート等) 向けの `ack.config.json` です。`scanPaths` で Syft 対象を指定します。

1. `npm install -D @s2j/acknowledgements`
2. 本ファイルをホストルートの `ack.config.json` としてコピーし、`pipeline.noticeProductName` を製品名に合わせて編集
3. `s2j-acknowledgements init --preset dir`
4. `doctor --config ack.config.json` → `generate --config ack.config.json`

`pipeline.noticeProductName` は **全プリセット共通**の Notice 製品名です ([config-schema.md](../../docs/config-schema.md))。WordPress 例は [../wordpress-plugin/](../wordpress-plugin/)、macOS は [../cozy-brew/](../cozy-brew/) (`xcode.productName`) を参照してください。
