require "rails_helper"

RSpec.describe Product, type: :model do
  describe "validations" do
    it "有効な属性なら valid" do
      expect(build(:product)).to be_valid
    end

    it "name がないと無効" do
      expect(build(:product, name: nil)).not_to be_valid
    end

    it "price がないと無効" do
      expect(build(:product, price: nil)).not_to be_valid
    end

    it "price が負の値なら無効" do
      expect(build(:product, price: -1)).not_to be_valid
    end

    it "price が 0 は有効" do
      expect(build(:product, price: 0)).to be_valid
    end
  end

  describe "status enum" do
    it "デフォルトは active" do
      product = create(:product)
      expect(product).to be_active
    end

    it "deleted! で削除済み状態になる" do
      product = create(:product)
      product.deleted!
      expect(product).to be_deleted
    end
  end

  describe "associations" do
    it "coupon は 1 対 1" do
      product = create(:product)
      create(:coupon, product: product)
      expect(product.reload.coupon).to be_present
    end

    it "product_images は 1 対多" do
      product = create(:product)
      create(:product_image, product: product)
      create(:product_image, product: product)
      expect(product.product_images.count).to eq(2)
    end

    it "destroy で coupon もカスケード削除される" do
      product = create(:product)
      create(:coupon, product: product)
      expect { product.destroy }.to change(Coupon, :count).by(-1)
    end
  end
end
