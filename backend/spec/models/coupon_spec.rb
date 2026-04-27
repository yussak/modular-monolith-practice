require "rails_helper"

RSpec.describe Coupon, type: :model do
  describe "validations" do
    it "有効な属性なら valid" do
      expect(build(:coupon)).to be_valid
    end

    it "code がないと無効" do
      coupon = build(:coupon, code: nil)
      expect(coupon).not_to be_valid
      expect(coupon.errors[:code]).to be_present
    end

    it "code が重複すると無効" do
      create(:coupon, code: "DUP00001")
      coupon = build(:coupon, code: "DUP00001")
      expect(coupon).not_to be_valid
    end

    it "同一 product に 2 つ目のクーポンを作れない" do
      existing = create(:coupon)
      coupon = build(:coupon, product: existing.product)
      expect(coupon).not_to be_valid
      expect(coupon.errors[:product_id]).to be_present
    end

    it "discount_value が 0 以下なら無効" do
      expect(build(:coupon, discount_value: 0)).not_to be_valid
      expect(build(:coupon, discount_value: -1)).not_to be_valid
    end

    it "percentage で 100 を超えると無効" do
      expect(build(:coupon, :percentage, discount_value: 101)).not_to be_valid
    end

    it "percentage で 100 は有効" do
      expect(build(:coupon, :percentage, discount_value: 100)).to be_valid
    end

    it "expires_at がないと無効" do
      expect(build(:coupon, expires_at: nil)).not_to be_valid
    end
  end

  describe "#valid_for_use_by?" do
    let(:user) { create(:user) }
    let(:coupon) { create(:coupon) }

    it "期限前で未使用なら true" do
      expect(coupon.valid_for_use_by?(user)).to be true
    end

    it "期限切れなら false" do
      expired = create(:coupon, :expired)
      expect(expired.valid_for_use_by?(user)).to be false
    end

    it "同じユーザーが既に使用済みなら false" do
      order = create(:order, user: user)
      create(:coupon_use, coupon: coupon, user: user, order: order, status: :used)
      expect(coupon.valid_for_use_by?(user)).to be false
    end

    it "別のユーザーが使用済みでも true" do
      other = create(:user)
      order = create(:order, user: other)
      create(:coupon_use, coupon: coupon, user: other, order: order, status: :used)
      expect(coupon.valid_for_use_by?(user)).to be true
    end
  end

  describe "#discount_amount_for" do
    let(:product) { create(:product, price: 1000) }

    context "固定額クーポン" do
      let(:coupon) { create(:coupon, product: product, discount_type: :fixed, discount_value: 300) }

      it "対象商品 1 個なら割引額をそのまま返す" do
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: product, quantity: 1)
        expect(coupon.discount_amount_for([ item ])).to eq(300)
      end

      it "対象商品を複数個入れても割引額は固定" do
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: product, quantity: 3)
        expect(coupon.discount_amount_for([ item ])).to eq(300)
      end

      it "割引額が商品合計より大きい場合は商品合計を上限とする" do
        over = create(:coupon, product: product, discount_type: :fixed, discount_value: 2000, code: "OVERBIG1")
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: product, quantity: 1)
        expect(over.discount_amount_for([ item ])).to eq(1000)
      end

      it "対象商品が cart_items にない場合は 0" do
        other_product = create(:product, price: 500)
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: other_product, quantity: 1)
        expect(coupon.discount_amount_for([ item ])).to eq(0)
      end
    end

    context "割合クーポン" do
      let(:coupon) { create(:coupon, :percentage, product: product, discount_value: 10) }

      it "商品合計に割引率を適用" do
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: product, quantity: 2)
        expect(coupon.discount_amount_for([ item ])).to eq(200)
      end

      it "割引率 100% なら商品合計と同額" do
        full = create(:coupon, :percentage, product: product, discount_value: 100, code: "FULL0001")
        cart = create(:cart)
        item = create(:cart_item, cart: cart, product: product, quantity: 1)
        expect(full.discount_amount_for([ item ])).to eq(1000)
      end
    end
  end
end
