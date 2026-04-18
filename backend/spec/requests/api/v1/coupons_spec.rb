require "rails_helper"

RSpec.describe "Api::V1::Coupons", type: :request do
  let!(:seller) { User.create!(name: "出品者", email: "seller@example.com", password: "password123") }
  let!(:other_user) { User.create!(name: "他ユーザー", email: "other@example.com", password: "password123") }
  let!(:product) { Product.create!(name: "商品A", price: 1000, user: seller) }

  def auth_header(user)
    { "Authorization" => "Bearer #{JwtHelper.encode(user_id: user.id)}" }
  end

  describe "POST /api/v1/products/:product_id/coupons" do
    let(:valid_params) do
      { discount_type: "fixed", discount_value: 500, expires_at: 1.month.from_now.iso8601 }
    end

    context "出品者本人の場合" do
      it "クーポンが作成される" do
        expect {
          post "/api/v1/products/#{product.id}/coupons", params: valid_params, headers: auth_header(seller), as: :json
        }.to change(Coupon, :count).by(1)

        expect(response).to have_http_status(:created)

        body = JSON.parse(response.body)
        expect(body).to include("discount_type" => "fixed", "discount_value" => 500)
        expect(body["product_id"]).to eq(product.id)
      end

      it "クーポンコードがシステムによって自動生成される" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params, headers: auth_header(seller), as: :json

        body = JSON.parse(response.body)
        expect(body["code"]).to be_present
        expect(body["code"].length).to be >= 8
      end
    end

    context "未認証の場合" do
      it "認証エラーになる" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "出品者本人でない場合" do
      it "権限エラーになる" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params, headers: auth_header(other_user), as: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "存在しない商品の場合" do
      it "商品が見つからない" do
        post "/api/v1/products/99999/coupons", params: valid_params, headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "既にクーポンが存在する商品の場合" do
      before do
        Coupon.create!(product: product, code: "EXISTING1", discount_type: "fixed", discount_value: 300, expires_at: 1.month.from_now)
      end

      it "クーポンを作成できない" do
        expect {
          post "/api/v1/products/#{product.id}/coupons", params: valid_params, headers: auth_header(seller), as: :json
        }.not_to change(Coupon, :count)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "必須パラメータが不足している場合" do
      it "discount_type が空なら作成できない" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params.except(:discount_type), headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "discount_value が空なら作成できない" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params.except(:discount_value), headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "expires_at が空なら作成できない" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params.except(:expires_at), headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "discount_value が不正な場合" do
      it "0 以下なら作成できない" do
        post "/api/v1/products/#{product.id}/coupons", params: valid_params.merge(discount_value: 0), headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "percentage で 100 を超える場合は作成できない" do
        post "/api/v1/products/#{product.id}/coupons", params: { discount_type: "percentage", discount_value: 101, expires_at: 1.month.from_now.iso8601 }, headers: auth_header(seller), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
