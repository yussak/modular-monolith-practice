# ADR-004: Dependabot 自動マージの前提条件

## ステータス

採用

## コンテキスト

ADR-003 で Dependabot PR の patch/minor 自動マージ（パターン B）を採用した。しかし、この自動マージが安全に機能するためには CI / Security パイプラインによるチェックが前提条件であることが ADR-003 では十分に明示されていなかった。

自動マージは「全チェック通過後にマージ」という仕組みであり、チェックがなければ未検証のコードが自動でマージされることになる。

## 決定

以下の CI / Security チェックを Dependabot 自動マージの前提条件として明示する。これらを削除・無効化する場合は、自動マージの運用も見直す必要がある。

| チェック | ワークフロー | 役割 |
|---|---|---|
| RuboCop | ci.yml | Backend コード品質 |
| RSpec | ci.yml | Backend テスト |
| ESLint | ci.yml | Frontend コード品質 |
| Vitest | ci.yml | Frontend テスト |
| Brakeman | security.yml | Backend 脆弱性検知 |
| bundler-audit | security.yml | gem の既知脆弱性検知 |
| npm audit | security.yml | npm パッケージの既知脆弱性検知 |

## 採用理由

- 自動マージの安全性は CI / Security チェックに依存しているため、この依存関係を明示しておく必要がある
- チェックの追加・削除時に自動マージへの影響を意識できるようにする
