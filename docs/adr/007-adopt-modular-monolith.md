# ADR-007: モジュラモノリス（packwerk）採用とパック分割方針

## ステータス

採用

## コンテキスト

このリポジトリは「モジュラモノリス（以下 MM）の練習」を中心テーマに掲げているが、これまで Phase 1（基本 EC 機能の実装）に集中しており、コードベースは完全モノリシックな Rails 標準構成のまま残っている（`packwerk` 未導入、`packs/` や `modules/` のディレクトリなし）。

現時点の規模:

- モデル 11 / コントローラ 7 / ルートアクション 27 / テーブル 9 / カラム 74
- ドメインは EC（ユーザー / 商品 / カート / 注文 / クーポン）
- リクエスト spec が約 1,000 行あり、既存挙動の安全網として機能している

コード上には既に 5 つのドメイン境界（認証・カタログ・カート・注文・マーケティング）が現れており、特にクーポン（`Coupon` / `CouponUse`）が User / Product / Order の 3 ドメインに横串で結合し、`Order` は 4 ドメインに依存している。今後さらに機能を追加すると暗黙の結合が増え、後から境界を切り直すコストが膨らむ。

「シンプルに MM を試したいが、効果は実感したい（複雑さ自体は目的ではない）」という現在の方針に照らすと、これ以上の機能追加を待つメリットは薄く、現状の素材で MM 化を始めるのが適切と判断した。

## 検討した案

### 案A: 今すぐ MM 移行を開始する（採用）

`packwerk` を導入してドメイン単位のパックに分割し、境界違反を機械的に検出・修正する。

- メリット: 横串依存が増え始めた今が「分割の痛み」を学べる最適タイミング。リクエスト spec が安全網として機能している
- デメリット: 「もう少し複雑な題材で試したい」という期待には応えない

### 案B: 通知機能などを 1 つ追加してから MM 移行

モジュール間の非同期連携を学ぶための題材（注文確定通知など）を 1 つだけ追加してから着手。

- メリット: イベント駆動連携の必然性が体感しやすい
- デメリット: 機能追加中に新たな結合が生まれ、MM 化作業に手戻りが出る。MM 本体の学びが機能追加のノイズに埋もれる

### 案C: 複数機能（在庫・決済・レビュー）を追加してから MM 移行

- メリット: MM の「ありがたみ」が最大化される
- デメリット: 結合が深くなりすぎ、分割作業自体が重労働になり学習意欲を削ぐ

### 案D: 先にユニットテスト・サービス層を整備してから MM 移行

- メリット: 安全網が厚くなる
- デメリット: 既存リクエスト spec で安全網は十分機能している。過剰準備

## 決定

**案A を採用。** 機能追加は行わず、現状のコードに対して `packwerk` を導入し、以下の 5 パックに分割する。

| パック | モデル | 責務 |
|---|---|---|
| `identity` | `User`, `Admin` | 認証・アカウント |
| `catalog` | `Product`, `ProductImage` | 商品カタログ |
| `cart` | `Cart`, `CartItem` | カート |
| `order` | `Order`, `OrderItem` | 注文 |
| `marketing` | `Coupon`, `CouponUse` | 販促・割引 |

### 依存方向

- `cart` → `catalog`, `identity`
- `order` → `cart`, `catalog`, `identity`, `marketing`
- `marketing` → `catalog`, `identity`
- `catalog` → `identity`（出品者参照のため）
- 逆方向・循環は禁止

### 公開 API ポリシー

- 各パックの公開 API は `packs/<pack>/app/public/` に配置
- それ以外は private（`enforce_privacy: true`）
- 依存も明示宣言（`enforce_dependencies: true`）

### 移行順序（独立度の高いものから）

1. `identity`
2. `catalog`
3. `cart`
4. `order`
5. `marketing`（横串依存が最多 → 山場として最後）

## 理由

- 「効果実感を最大化する」観点では、横串依存が現れている今の規模が学びのピーク。`Coupon` 周辺で「Public API の必要性」を体感できる
- packwerk は Shopify 由来で Rails コミュニティでの実績があり、境界違反を機械的に検出できる（学習効果の可視化に最適）
- パック分割と公開 API 導入は段階的に進められるため、リスクが低い（途中で `package_todo.yml` に棚上げして緑を維持できる）
- MM 化後に通知・在庫・決済などの新機能を追加する経験のほうが、実務的価値が高い（「MM 済みの状態で機能を足す」順序）

## 影響

- 新規ディレクトリ: `packs/<domain>/app/**`, `packs/<domain>/spec/**`, `packs/<domain>/package.yml`
- 既存モデル・コントローラのファイル位置が変わる（`backend/app/**` から `backend/packs/<domain>/app/**` へ移動）
- `Gemfile` に `packwerk` 追加（exact version 固定 — `docs/security-policy.md` 準拠）
- `config/application.rb` でパック配下のオートロード設定が必要になる可能性
- ルーティング (`config/routes.rb`) は当面そのまま、必要に応じて namespace 整理は別 ADR で扱う
- 各パックの Public API 設計判断は本 ADR に追記、または個別 ADR を起こす
- `TODO.md` の Phase 2 のうち「名前空間・ディレクトリでモジュール分割」「モジュール間インターフェース定義」が本 ADR でカバーされる
- 「イベント基盤の導入」「通知機能」は MM 化完了後の別 ADR とする（同期呼び出しで足りない実感が出てから）

## 結果（初回移行時の違反件数推移）

| 段階 | 違反件数 | メモ |
|---|---|---|
| ビフォー（パック未分割） | 0 | ルートパックのみ。検出対象なし |
| 5パック作成・ファイル移動直後 | 52 | spec から各パック参照（42）+ パック内（10） |
| spec を各パックに移動後 | 10 | 残りはモデルの inverse 関連と shared 基底クラス参照 |
| `Authenticatable` concern 切り出し（root↔identity 循環解消）後 | 7 | shared 基底クラスの循環依存を削除 |
| `User` の inverse 関連 3 本 + `CouponUse#belongs_to :order` を削除後 | 3 | 残りは `Product` の inverse 関連 3 本 |
| 残り 3 件を `package_todo.yml` に記録 | 0（todo 管理下） | `bin/packwerk check` 緑 |

### 学んだこと

- **Rails の `has_many` / `has_one` / `belongs_to` は packwerk が constant 参照として検出する。**
  シンボル引数 (`:cart`) でも内部で `Cart` クラス名に解決されるため、暗黙の結合がそのまま可視化される。
- **inverse 関連（親→子）はパック境界では循環依存になる。** `User has_many :orders` を残すと identity → order の依存が発生。MM の依存方向は子→親（`Order belongs_to :user`）のみが自然。
- **shared 基底クラス（`ApplicationController`, `ApplicationRecord`）に他パック由来の concern を埋め込むと root↔identity の循環依存が発生する。** 認証ロジックを `Authenticatable` concern に切り出して、必要なコントローラだけが `include` する形が MM 的に正しい。
- **`dependent: :destroy` の cascade は inverse 関連に依存している。** Product の cart_items / order_items / coupon は cascade を保つために associations を残し、`package_todo.yml` で受け入れた。イベント基盤導入時に再設計する。

## 参考

- [Shopify Engineering: Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)
- packwerk: https://github.com/Shopify/packwerk
