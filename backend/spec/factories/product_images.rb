FactoryBot.define do
  factory :product_image do
    association :product
    sequence(:url) { |n| "https://example.com/img/#{n}.jpg" }
    position { 0 }
  end
end
