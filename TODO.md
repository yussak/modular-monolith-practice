# EC サイト 機能 TODO

まずは最低限のECサイトを作る。どうやってモジュラモノリスにするかの検討はそこまでできてからやる
---

## TODO

ユーザー周り
- [x] 会員登録・ログイン・ログアウト

商品周り
- [x] 商品CRUD
- [ ] 商品編集のみまだ

購入フロー
- [ ] カートに追加・削除・数量変更
- [ ] 注文確定（住所入力・決済はモック）
- [ ] 注文履歴の確認


在庫
- [ ] a

通知
- [ ] a

---

## CI整備

GitHub Actions で lint + test の CI を整備する。

### Backend

- [x] rubocop (lint)
- [ ] rspec (test) — PostgreSQL service container が必要

コメントアウトで残す候補:
- [ ] brakeman (セキュリティ静的解析)
- [ ] bundler-audit (gem 脆弱性チェック)

### Frontend

- [ ] ESLint 導入 (lint)
- [ ] vitest (test)

コメントアウトで残す候補:
- [ ] tsc --noEmit (型チェック)