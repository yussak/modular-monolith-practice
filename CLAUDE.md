# CLAUDE.md

Claude Code がこのプロジェクトで作業する際の指示書。

複数案を提示する際には推奨度（Max星５つ）とその理由もください。

## プロジェクト概要

モジュラーモノリスアーキテクチャの学習・実験用リポジトリ。
Rails API + Next.js のフルスタック構成を Docker Compose で管理する。
ドメインモジュールの境界設計や依存管理の実装パターンを試すことが主目的。

## 技術スタック

- **Backend**: Ruby on Rails 8.1.2 (API mode)
- **Frontend**: Next.js (TypeScript)
- **DB**: PostgreSQL
- **インフラ**: Docker / Docker Compose

## よく使うコマンド

```bash
# 起動
docker compose up

# バックグラウンドで起動
docker compose up -d

# Rails コンソール
docker compose exec backend rails c

# マイグレーション
docker compose exec backend rails db:migrate

# テスト実行
docker compose exec backend rails test

# フロントエンド開発サーバー（ローカル直接実行の場合）
cd frontend && npm run dev
```

## Claudeへの指示

### 基本方針

- 変更前に必ず対象ファイルを読んでから編集すること
- 求められていない機能追加・リファクタリング・コメント追加は行わない
- セキュリティ上の問題（SQLインジェクション、XSSなど）があればすぐに指摘・修正する

### コーディング規約

- Ruby: `rubocop-rails-omakase` に従う（`.rubocop.yml` 参照）
- TypeScript: 既存の `tsconfig.json` の設定に従う
- 新しい抽象化・ヘルパーは本当に必要な場合のみ作成する

### アーキテクチャ方針（随時更新）

- モジュール間の依存は明示的に管理する（暗黙の結合を避ける）
- モジュール境界を越える操作はインターフェース経由で行う
- 具体的なモジュール構成は設計が固まり次第ここに追記する
