class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  enum :status, { confirmed: 0, cancelled: 1 }

  validates :order_number, presence: true, uniqueness: true
end
