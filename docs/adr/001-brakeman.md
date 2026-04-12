# ADR-001: brakeman（Rails セキュリティ静的解析）の導入

## ステータス

採用

## コンテキスト

本プロジェクトは EC サイトであり、ユーザー認証・商品管理・注文処理など、セキュリティ上の考慮が必要な機能を扱っている。
コードレビューだけでは見落としやすいセキュリティ上の問題を、CI で自動的に検出する仕組みが欲しい。

## brakeman とは

[Brakeman](https://brakemanscanner.org/) は Ruby on Rails に特化したセキュリティ静的解析ツール。
アプリケーションを実行せずにソースコードを解析し、脆弱性の可能性がある箇所を検出する。

### 検出できる主な脆弱性

| カテゴリ | 例 |
|---|---|
| SQL インジェクション | `User.where("name = '#{params[:name]}'")` のような文字列補間 |
| クロスサイトスクリプティング (XSS) | `raw` や `html_safe` の不適切な使用 |
| マスアサインメント | `permit` なしの `params` 直接使用 |
| コマンドインジェクション | `system` や `exec` にユーザー入力を渡している箇所 |
| オープンリダイレクト | `redirect_to params[:url]` のような外部リダイレクト |
| CSRF 設定不備 | `protect_from_forgery` の無効化 |
| 安全でないデシリアライゼーション | `YAML.load` や `Marshal.load` の使用 |
| EOL（サポート終了）の Rails/Ruby バージョン | サポート期限切れの検知 |

### rubocop との違い

- **rubocop**: コーディングスタイル・品質の統一（命名、インデント、複雑度など）
- **brakeman**: セキュリティに特化した解析（データフローを追跡して脆弱性パターンを検出）

rubocop は「コードの書き方」を、brakeman は「コードの安全性」をチェックする。役割が異なるので両方入れる意味がある。

### 他のセキュリティツールとの違い

- **bundler-audit**: gem の既知脆弱性（CVE）をチェック → 依存パッケージの問題
- **brakeman**: 自分が書いたコードの脆弱性をチェック → アプリケーションコードの問題
- **Dependabot**: 依存パッケージの更新 PR を自動作成 → 脆弱性への対応を自動化

## 決定

CI に brakeman を追加し、PR ごとにセキュリティチェックを自動実行する。

### 実行方法

```bash
# Docker 経由
docker compose exec backend bundle exec brakeman

# CI（GitHub Actions）
bundle exec brakeman --no-pager
```

## 補足

- 現時点（2026-04-12）のスキャン結果は警告 0 件
- false positive が出た場合は `config/brakeman.ignore` で管理できる
