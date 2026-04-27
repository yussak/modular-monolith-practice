FactoryBot.define do
  factory :coupon_use do
    association :coupon
    association :user
    association :order
    status { :used }
  end
end
