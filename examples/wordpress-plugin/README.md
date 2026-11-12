# WordPress プラグイン — Acknowledgements 例

プラグインルート (`composer.json` があるディレクトリ) 向けの `ack.config.json` です。

1. `npm install -D @s2j/acknowledgements`
2. 本ファイルを `ack.config.json` としてコピー
3. `composer install` のあと `s2j-acknowledgements init --preset wordpress`
4. Syft を導入し、`doctor --config ack.config.json`
5. `generate --config ack.config.json` (`pipeline.feluda: true` のため Feluda が PATH に必要)

`vendor/` とルートの `.` を Syft 対象にし、SPDX をマージします ([presets.md](../../docs/presets.md))。
