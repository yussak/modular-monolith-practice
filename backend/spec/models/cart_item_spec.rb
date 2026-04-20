require "rails_helper"

RSpec.describe CartItem, type: :model do
  describe "associations" do
    it "cart と product を持つ" do
      item = build(:cart_item)
      expect(item.cart).to be_present
      expect(item.product).to be_present
    end
  end

  describe "同一カート内での商品の一意性" do
    it "同じカート内に同じ商品を 2 行作ることはできない" do
      cart = create(:cart)
      product = create(:product)
      create(:cart_item, cart: cart, product: product)
      expect { create(:cart_item, cart: cart, product: product) }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it "別のカートなら同じ商品を入れられる" do
      product = create(:product)
      cart_a = create(:cart)
      cart_b = create(:cart)
      create(:cart_item, cart: cart_a, product: product)
      expect { create(:cart_item, cart: cart_b, product: product) }.not_to raise_error
    end
  end
end
