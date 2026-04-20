FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "商品#{n}" }
    description { "商品の説明" }
    price { 1000 }
    status { :active }
    association :user

    trait :deleted do
      status { :deleted }
    end
  end
end
