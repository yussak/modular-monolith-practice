FactoryBot.define do
  factory :coupon do
    association :product
    sequence(:code) { |n| "COUPON%08d" % n }
    discount_type { :fixed }
    discount_value { 300 }
    expires_at { 1.month.from_now }

    trait :percentage do
      discount_type { :percentage }
      discount_value { 10 }
    end

    trait :expired do
      expires_at { 1.day.ago }
    end
  end
end
