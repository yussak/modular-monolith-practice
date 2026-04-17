# ADR-004: CI ワークフローの permissions 最小化

## ステータス

提案中

## コンテキスト

2025〜2026年にかけて GitHub Actions を侵害経路としたサプライチェーン攻撃が多発している（tj-actions/reviewdog、Trivy 等）。侵害された Action が `GITHUB_TOKEN` の権限を悪用し、リポジトリへの書き込みやシークレットの窃取を行う手口が確認されている。

本プロジェクトの `ci.yml` と `security.yml` には `permissions` が未指定で、GitHub のデフォルト権限が付与されている。デフォルトは リポジトリ設定に依存するが、`contents: write` 等の広い権限が含まれうる。一方、これらのワークフローはコードの checkout・lint・テスト・セキュリティスキャンのみを行い、リポジトリへの書き込みは不要。

`dependabot-auto-merge.yml` は既に `contents: write` / `pull-requests: write` を明示しており、対応済み。

## 決定

`ci.yml` と `security.yml` にトップレベルで `permissions: {}` を宣言し、全権限をデフォルト拒否する。各ジョブには必要な `contents: read` のみを付与する。

### 変更内容

| ワークフロー | 変更前 | 変更後 |
|---|---|---|
| `ci.yml` | `permissions` 未指定 | トップレベル `permissions: {}`、各ジョブに `contents: read` |
| `security.yml` | `permissions` 未指定 | トップレベル `permissions: {}`、各ジョブに `contents: read` |
| `dependabot-auto-merge.yml` | 明示済み（変更なし） | — |

## 理由

- **最小権限の原則**: GitHub 公式も `permissions` の明示を推奨している。未指定のままだとデフォルト設定次第で不要な権限が付与される
- **侵害時の影響範囲を限定**: Action が侵害されても `contents: read` しかなければリポジトリへの書き込みや PR 操作はできない
- **コストが極めて低い**: YAML に数行追加するだけで、既存の動作に影響しない
- **可逆性が高い**: 問題があれば `permissions` 行を削除するだけで元に戻せる

## 影響

- `ruby/setup-ruby@v1` の `bundler-cache: true` はキャッシュの読み書きに `actions/cache` を内部利用するが、これは `GITHUB_TOKEN` の `actions: write` ではなく Cache API を使うため、`contents: read` のみで動作する
- 今後新しいジョブを追加する際は、必要な permissions をジョブレベルで明示する運用が必要
