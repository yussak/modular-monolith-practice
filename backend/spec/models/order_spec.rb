require "rails_helper"

RSpec.describe Order, type: :model do
  describe "validations" do
    it "有効な属性なら valid" do
      expect(build(:order)).to be_valid
    end

    it "order_number がないと無効" do
      expect(build(:order, order_number: nil)).not_to be_valid
    end

    it "order_number が重複すると無効" do
      existing = create(:order)
      expect(build(:order, order_number: existing.order_number)).not_to be_valid
    end
  end

  describe "status enum" do
    it "confirmed で作成できる" do
      order = create(:order)
      expect(order).to be_confirmed
    end

    it "cancelled! でキャンセル状態になる" do
      order = create(:order)
      order.cancelled!
      expect(order).to be_cancelled
    end
  end

  describe "associations" do
    it "order_items が destroy でカスケード削除される" do
      order = create(:order)
      create(:order_item, order: order)
      expect { order.destroy }.to change(OrderItem, :count).by(-1)
    end

    it "coupon_use が destroy でカスケード削除される" do
      user = create(:user)
      order = create(:order, user: user)
      create(:coupon_use, order: order, user: user)
      expect { order.destroy }.to change(CouponUse, :count).by(-1)
    end
  end
end
