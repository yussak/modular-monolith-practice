class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  enum :status, { confirmed: "confirmed", cancelled: "cancelled" }

  validates :order_number, presence: true, uniqueness: true
end
