# CLAUDE.md

Claude Code がこのプロジェクトで作業する際の指示書。

複数案を提示する際には推奨度（Max星５つ）とその理由もください。

## プロジェクト概要

個人開発の学習・実験用リポジトリ。色々試す場所として運用している。
モジュラーモノリスアーキテクチャの練習が中心テーマだが、それに限定しない。
興味のある技術（Nix、インフラ、設計手法など）は何でも試す。
Rails API + Next.js のフルスタック構成を Docker Compose で管理する。

学習目的のリポジトリだが、実運用を想定した設計・品質基準を目指して対応する。

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

# テスト実行（RSpec）
docker compose exec -e RAILS_ENV=test backend rspec

# セキュリティチェック（Brakeman）
docker compose exec backend bundle exec brakeman

# フロントエンド開発サーバー（ローカル直接実行の場合）
cd frontend && npm run dev

# フロントエンド lint（ESLint）
cd frontend && npm run lint
```

## Claudeへの指示

### 基本方針

- 変更前に必ず対象ファイルを読んでから編集すること
- 求められていない機能追加・リファクタリング・コメント追加は行わない
- セキュリティ上の問題（SQLインジェクション、XSSなど）があればすぐに指摘・修正する

### 設計議論・ADR 作成時の対応方針

- ユーザーが明示していない論拠・理由・メリットを推測で創作して文書に書かない（ADR の「検討した案」「採用理由」も含む）
- ユーザーの発言の向きを逆方向に読み替えない（例:「複雑さが足りない」という懸念を「規模が小さいうちに」と裏返さない）
- 結果を理由として書かない（循環論法の回避）。ある決定の帰結は、その決定の採用理由にはならない
- 皮肉・反語的な問いかけを論理的反論として扱わない。意図が曖昧な発言はそのまま文面どおり受け取るか、確認する
- 「記述を省く／書かない」という提案は、まず文字どおり（書かなくてよい）の意味として受け取る

### コーディング規約

- Ruby: `rubocop-rails-omakase` に従う（`.rubocop.yml` 参照）
- TypeScript: 既存の `tsconfig.json` の設定に従う
- 新しい抽象化・ヘルパーは本当に必要な場合のみ作成する

### アーキテクチャ方針（随時更新）

- モジュール間の依存は明示的に管理する（暗黙の結合を避ける）
- モジュール境界を越える操作はインターフェース経由で行う
- 具体的なモジュール構成は設計が固まり次第ここに追記する

## セキュリティ

@docs/security-policy.md
