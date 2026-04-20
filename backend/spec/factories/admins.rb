FactoryBot.define do
  factory :admin do
    sequence(:name) { |n| "管理者#{n}" }
    sequence(:email) { |n| "admin#{n}@example.com" }
    password { "password123" }
  end
end
