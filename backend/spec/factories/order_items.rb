FactoryBot.define do
  factory :order_item do
    association :order
    association :product
    product_name { product.name }
    unit_price { product.price }
    quantity { 1 }
  end
end
