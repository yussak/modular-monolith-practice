class Product < ApplicationRecord
  belongs_to :user
  has_many :product_images, dependent: :destroy

  validates :name, presence: true
  validates :price, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
