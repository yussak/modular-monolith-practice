FactoryBot.define do
  factory :order do
    association :user
    sequence(:order_number) { |_n| SecureRandom.uuid }
    status { :confirmed }
    discount_amount { 0 }

    trait :cancelled do
      status { :cancelled }
    end
  end
end
