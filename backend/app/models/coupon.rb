class Coupon < ApplicationRecord
  belongs_to :product
  has_many :coupon_uses, dependent: :destroy

  enum :discount_type, { fixed: "fixed", percentage: "percentage" }

  validates :code, presence: true, uniqueness: true
  validates :discount_type, presence: true
  validates :discount_value, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :discount_value, numericality: { less_than_or_equal_to: 100 }, if: :percentage?
  validates :expires_at, presence: true
  validates :product_id, uniqueness: true
end
