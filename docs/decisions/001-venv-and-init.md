# S2J Acknowledgements - 設計決定 ADR-001: ホスト `./venv/` と `init`

## 状況

onot は Python 製。pipx だけに依存すると CI と新人の再現性が弱い。

## 決定

1. ホスト標準はルート直下 **`venv/`** (Ack venv)。アプリ開発用 **`.venv/`** とは別。
2. **`npm install` では venv を作らない**。作成は **`s2j-acknowledgements init`** のみ。
3. `init` の pip は **`onot[spdx,cyclonedx]` をピン留め**し、**`openpyxl` も同時にインストール**する (import 回避を常時カバー)。
4. **`init` は冪等**: 既存 `ack.config.json` はデフォルトでスキップ (WARN、`exit 0`)。上書きは `--force` のみ。
5. **`.gitignore`**: ないときは案内。作成は `--write-gitignore` のみ。既存ファイルへの自動追記は v1では行わない。
6. `doctor` / `generate` の onot 解決順は [cli.md](../cli.md) が正本。

## 影響

* [install.md](../install.md)、[cli.md](../cli.md)、[usage.md](../usage.md)
