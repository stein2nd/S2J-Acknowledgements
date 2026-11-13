# WordPress プラグイン — Acknowledgements 例

プラグインルート (`composer.json` があるディレクトリ) 向けの `ack.config.json` です。

1. `npm install -D @s2j/acknowledgements`
2. 本ファイルを `ack.config.json` としてコピー
3. `composer install` のあと `s2j-acknowledgements init --preset wordpress`
4. Syft を導入し、`doctor --config ack.config.json`
5. `generate --config ack.config.json` (`pipeline.feluda: true` のため Feluda が PATH に必要)

`vendor/` とルートの `.` を Syft 対象にし、SPDX をマージします ([presets.md](../../docs/presets.md))。

### OSS Notice 見出し

配布物向けには `pipeline.noticeProductName` に **プラグインの正式名**を入れます (onot 見出し `OSS Notice for …`)。未設定のまま `generate` すると `host-sbom` となり、`doctor` / `generate` が WARN します。macOS アプリは代わりに `xcode.productName` でも可 ([config-schema.md](../../docs/config-schema.md))。
