# クーポン使用記録
# 1ユーザー1回の利用制限管理と、注文キャンセル時のクーポン復元のために必要。
#
# 注: order への belongs_to は MM パック境界（order → marketing は許可、逆は禁止）の
# 都合で削除。order_id は plain integer として保持し、Order 側の has_one :coupon_use と
# DB 上の参照のみで運用する。
class CouponUse < ApplicationRecord
  belongs_to :coupon  # どのクーポンが使われたか
  belongs_to :user    # 誰が使ったか（1ユーザー1回制限の判定に必要）

  enum :status, { unused: "unused", used: "used" }

  validates :status, presence: true
  validates :order_id, presence: true
end
