# S2J Acknowledgements - 設計決定 ADR-003: SPDX マージと Syft 入力

## 状況

`macos-app` の SPM マージと、`wordpress` の複数 `scanPaths` の関係が文書上あいまいだった。

## 決定

1. **マージ条件**: 解決後の Syft 対象が **2つ以上** のとき、各 SPDX JSON を生成し **1つにマージ**してから Feluda / onot に渡す (`xcode.merge` は macOS 向けの「何をスキャンするか」の定義)。
2. **マージキー**: パッケージ重複は `name@version` で一意化 ([pipeline.md](../pipeline.md))。
3. **`scan.exclude`**: 正本は [pipeline.md](../pipeline.md)。各パターンを Syft の `--exclude` に **1パターン1フラグ** で渡す。
4. **`scanPaths` 正規化**: ホストルート相対で解決し、`.` と `./` は同義。
5. **`composer.lock` 単体スキャン**: v1 **非対象**。必要なら `vendor/` スキャンか v1.1で検証後に追加。
6. **最終成果物**: onot が `{workDir}/onot-notice/` に出力した `.md` を `output` に **そのままコピー** (v1ではリネーム・加工なし。onot v1.2.x の `-o` はディレクトリ)。

## 影響

* [pipeline.md](../pipeline.md)、[presets.md](../presets.md)、[config-schema.md](../config-schema.md)
