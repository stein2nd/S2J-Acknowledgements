# S2J Acknowledgements - Xcode ターゲット解決

`macos-app` プリセットで Release `.app` を見つける手順です。
**ホストプロジェクトルート** は [cli.md](./cli.md) に従い `--cwd` (デフォルト `process.cwd()`) です。`ack.config.json` は通常このルートに置きます。`package.json` がないホスト (例: WordPress のみ) でも、`ack.config.json` + `--cwd` で運用します。

## 優先順位

解決は下記の順で試み、**最初に成功した方法** を採用します。

| 順位 | 手段 | 用途 |
| --- | --- | --- |
| 1 | 明示パス | CI、再現性 |
| 2 | `xcodebuild -showBuildSettings` | ビルド直後のローカル |
| 3 | DerivedData の glob | ローカル (フォールバック) |
| 4 | `mdfind` (限定) | 最終手段 (v1では任意実装) |

## 1. 明示パス

下記のいずれかが設定されていれば、他を試しません。

* `ack.config.json` の `xcode.appPath`
* 環境変数 `ACK_APP`
* CLI `--app`

パスは `.app` ディレクトリを指す必要があります (ファイルでないこと)。

## 2. xcodebuild

### 前提

* ルート付近に `ack.config.json` の `xcode.project` または自動検出した `*.xcodeproj`
* `xcode.scheme` (未指定時はプリセットまたは単一 Scheme 推論 — 複数ある場合は設定必須)

### コマンド (概念)

```zsh
xcodebuild \
  -project "${PROJECT}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -showBuildSettings
```

### 取得する設定

| キー | 用途 |
| --- | --- |
| `BUILT_PRODUCTS_DIR` | Products ディレクトリ |
| `WRAPPER_NAME` または `FULL_PRODUCT_NAME` | `.app` 名 |

結合: `${BUILT_PRODUCTS_DIR}/${WRAPPER_NAME}`

`project.yml` (XcodeGen) のみで `.xcodeproj` がない場合は、生成済み `*.xcodeproj` の存在を前提とするか、Scheme 名から DerivedData にフォールバックします (ホスト README に「先に xcodegen / ビルドを実行」と記載)。

## 3. DerivedData glob

### パスパターン (草案)

```text
~/Library/Developer/Xcode/DerivedData/<DerivedDataFolder>/Build/Products/Release/*.app
```

`<DerivedDataFolder>` の推定:

* `*.xcodeproj` のプロジェクト名
* `project.yml` の `name` (yaml パース — 依存 `yaml` は許容)
* `xcode.productName` と組み合わせ

### 複数ヒット時

| 戦略 | 説明 |
| --- | --- |
| `productName` 一致 | `CozyBrewApp.app` で絞る |
| mtime 最新 | 同一条件で複数残る場合 |
| 失敗 | 2件以上で識別不能なら exit `2` とし、明示パスを促す |

## 4. mdfind (任意)

```zsh
mdfind 'kMDItemFSName == "CozyBrewApp.app"'
```

単独では **古いビルド** を拾うため、パスに `Build/Products/Release` を含むものに限定します。
v1では DerivedData glob が十分なら **未実装でもよい** とします。

## SPM checkouts パス (マージ用)

`.app` 解決と独立に、`spm-checkouts` マージ用ディレクトリを探します。

### 優先

DerivedData フォルダー内:

```text
.../SourcePackages/checkouts
```

### フォールバック

リポジトリ内 `.build/checkouts` (SwiftPM ローカルビルド) — 存在すれば追加スキャン。

## `project.yml` 手がかり

XcodeGen プロジェクトでは、下記を読み取ります (ベストエフォート)。

| キー | 用途 |
| --- | --- |
| `name` | DerivedData 接頭辞の推定 |
| `targets.*.scheme` / ターゲット名 | Scheme 推論 |

パース失敗時は `xcode.scheme` の明示設定にフォールバックします。

## 失敗時メッセージ

stderr に下記を含めます。

1. 試した解決手段の一覧
2. 推奨: Release ビルド後に再実行、`--app` / `ACK_APP` の指定
3. `ack:doctor` とは別問題であること (ツールはそろっていても `.app` がない場合)

## CI 推奨

GitHub Actions 等では **ビルドステップの直後** に `xcodebuild -showBuildSettings` が最も安定します。
artifact として `.app` パスを env に書き、`ACK_APP` を渡す方式も有効です。
