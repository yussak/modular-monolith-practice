require "rails_helper"

RSpec.describe Cart, type: :model do
  describe "associations" do
    it "user に属する" do
      cart = build(:cart)
      expect(cart.user).to be_present
    end

    it "cart_items を複数持てる" do
      cart = create(:cart)
      create(:cart_item, cart: cart)
      create(:cart_item, cart: cart)
      expect(cart.cart_items.count).to eq(2)
    end

    it "destroy で cart_items もカスケード削除される" do
      cart = create(:cart)
      create(:cart_item, cart: cart)
      expect { cart.destroy }.to change(CartItem, :count).by(-1)
    end
  end

  describe "1 ユーザー 1 カート制約" do
    it "同じユーザーの 2 つ目のカートは作れない" do
      user = create(:user)
      create(:cart, user: user)
      expect { create(:cart, user: user) }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
