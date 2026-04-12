# EC サイト 機能 TODO

まずは最低限のECサイトを作る。どうやってモジュラモノリスにするかの検討はそこまでできてからやる

---

## Phase 1: 機能追加（標準 Rails で実装）

ユーザー周り
- [x] 会員登録・ログイン・ログアウト

商品周り
- [x] 商品CRUD

購入フロー
- [x] カートに追加・削除・数量変更
- [x] 注文確定（住所入力・決済はモック）
- [x] 注文履歴の確認

クーポン・割引

マイグレーション
- [x] coupons テーブル作成
- [x] coupon_uses テーブル作成
- [x] orders テーブルに discount_amount カラム追加

モデル作成 + リレーション設定
- [ ] Coupon（Product との belongs_to）
- [ ] CouponUse（Coupon, User, Order との belongs_to）
- [ ] 既存 Product にクーポンリレーション追加
- [ ] 既存 Order にクーポン関連カラム・リレーション追加

クーポンを作成する
- [ ] ルーティング: POST /api/v1/products/:product_id/coupons
- [ ] CouponsController#create アクション
- [ ] 出品者本人のみ作成可能のバリデーション
- [ ] 1商品1クーポンのバリデーション
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] クーポン作成フォーム（商品詳細 or 商品管理画面）

クーポン一覧を見る
- [ ] ルーティング: GET /api/v1/products/:product_id/coupons
- [ ] CouponsController#index アクション
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] クーポン一覧画面

クーポンを変更する
- [ ] ルーティング: PATCH /api/v1/coupons/:id
- [ ] CouponsController#update アクション
- [ ] 出品者本人のみ変更可能のバリデーション
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] クーポン編集フォーム

クーポンを削除する
- [ ] ルーティング: DELETE /api/v1/coupons/:id
- [ ] CouponsController#destroy アクション
- [ ] 出品者本人のみ削除可能のバリデーション
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] 削除ボタン

注文時にクーポンを適用する
- [ ] 既存 POST /api/v1/orders にクーポンコードパラメータ追加
- [ ] クーポン有効性検証（存在・期限・未使用・対象商品がカートにあるか）
- [ ] 割引額計算（固定額 / 割合、対象商品の金額が上限）
- [ ] coupon_uses レコード作成（status: used）
- [ ] orders.discount_amount に割引額を記録
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] 注文確定画面にクーポンコード入力欄

注文キャンセル時にクーポンを戻す
- [ ] 既存キャンセル処理に coupon_uses レコード削除を追加
- [ ] テスト作成
- [ ] テスト実行・パス確認

注文履歴でクーポン割引を表示する
- [ ] 既存 GET /api/v1/orders, GET /api/v1/orders/:id のレスポンスに割引額を追加
- [ ] テスト作成
- [ ] テスト実行・パス確認
- [ ] 注文履歴・注文詳細画面に割引額表示

## Phase 2: モジュール分離（モジュラーモノリス練習）

- [ ] 名前空間・ディレクトリでモジュール分割
- [ ] モジュール間インターフェース定義
- [ ] イベント基盤の導入
- [ ] 通知機能（イベント駆動で実装）
  - [ ] 注文確定通知
  - [ ] 在庫切れ通知（出品者向け）

## Phase 3: 追加機能（余力があれば）

- [ ] レビュー・評価
- [ ] 在庫管理

---

## CI整備

GitHub Actions で lint + test の CI を整備する。

### Backend

- [x] rubocop (lint)
- [x] rspec (test) — PostgreSQL service container が必要

コメントアウトで残す候補:
- [x] brakeman (セキュリティ静的解析)
- [x] bundler-audit (gem 脆弱性チェック)
- [x] dependabot

### Frontend

- [x] ESLint 導入 (lint)
- [x] vitest (test)
- [x] npm audit (脆弱性チェック)

コメントアウトで残す候補:
- [ ] tsc --noEmit (型チェック)

### CI改善

- [ ] セキュリティ workflow を別ファイルに分離（security.yml）+ weekly schedule 追加
- [ ] paths フィルタの per-job 化（frontend 変更で backend job が走る無駄を解消）
- [ ] push トリガー削除（デバッグ用の一時設定）
