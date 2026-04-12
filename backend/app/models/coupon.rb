class Coupon < ApplicationRecord
  belongs_to :product
  has_many :coupon_uses, dependent: :destroy

  enum :discount_type, { fixed: "fixed", percentage: "percentage" }

  validates :code, presence: true, uniqueness: true
  validates :discount_type, presence: true
  validates :discount_value, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :expires_at, presence: true
end
