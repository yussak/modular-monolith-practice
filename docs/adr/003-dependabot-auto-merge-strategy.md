# ADR-003: Dependabot 自動マージ戦略

## ステータス

採用（一部 [ADR-004](004-dependabot-major-version-ignore.md) で更新）

## コンテキスト

Dependabot が weekly で 3 エコシステム（bundler / npm / github-actions）の更新 PR を作成しているが、すべて手動マージしているため PR が溜まりやすい。マージの手間を減らしつつ、破壊的変更を見逃さない運用を決める必要があった。

## 検討した案

### 案A: 完全手動マージ

すべての Dependabot PR を人が確認してマージする。

- メリット: 最も安全。変更内容を毎回目視確認できる
- デメリット: PR が溜まりやすく、放置すると Dependabot PR だらけになる

### 案B: patch/minor は自動、major は手動

semver に基づいて自動マージの範囲を制御する。patch と minor アップデートは CI 通過後に自動マージし、major アップデートのみ手動確認する。

- メリット: リスクと手間のバランスが良い。業界で最も一般的な運用パターン
- デメリット: semver を正しく守らないライブラリでは patch/minor でも破壊的変更が入る可能性がある

### 案C: dev dependencies のみ自動マージ

テストツール・linter 等の開発依存だけ自動マージし、本番依存は手動確認する。

- メリット: 本番に影響するライブラリは必ず人が確認できる
- デメリット: 本番依存の PR は結局溜まる。案A と同じ問題が本番依存で残る

## 決定

**案B を採用。** GitHub Actions ワークフロー（`dependabot-auto-merge.yml`）で `dependabot/fetch-metadata` を使い、major 以外の Dependabot PR に `gh pr merge --auto` を実行する。

## 採用理由

- 学習・実験用リポジトリであり、本番障害のリスクがない
- CI（RSpec, RuboCop, ESLint, Vitest）とセキュリティチェック（Brakeman, bundler-audit, npm audit）が既にあり、自動マージ前のガードとして機能する
- 設定を消すだけで手動運用に戻せる（可逆性が高い）
- 今後本番運用に近づける場合は、案C（dev dependencies のみ自動）への段階的移行が容易

## 補足

- `gh pr merge --auto` の動作には、リポジトリ設定で「Allow auto-merge」の有効化と Branch Protection Rule（必須ステータスチェック）の設定が必要
- CI / Security ワークフローの paths フィルタに `.github/**` を追加し、github-actions エコシステムの PR でもチェックが実行されるようにする（Branch Protection との整合性確保）
