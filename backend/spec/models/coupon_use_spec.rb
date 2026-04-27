require "rails_helper"

RSpec.describe CouponUse, type: :model do
  describe "validations" do
    it "有効な属性なら valid" do
      expect(build(:coupon_use)).to be_valid
    end
  end

  describe "status enum" do
    it "used を持つ" do
      coupon_use = create(:coupon_use)
      expect(coupon_use).to be_used
    end

    it "unused も設定可能（DB デフォルト）" do
      user = create(:user)
      order = create(:order, user: user)
      coupon = create(:coupon)
      coupon_use = CouponUse.create!(coupon: coupon, user: user, order: order, status: :unused)
      expect(coupon_use).to be_unused
    end
  end

  describe "同じクーポンを同じユーザーが 2 回使えない制約" do
    it "DB 制約で重複を拒否する" do
      user = create(:user)
      coupon = create(:coupon)
      order_a = create(:order, user: user)
      order_b = create(:order, user: user)
      create(:coupon_use, coupon: coupon, user: user, order: order_a)
      expect { create(:coupon_use, coupon: coupon, user: user, order: order_b) }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
