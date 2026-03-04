require "rails_helper"

RSpec.describe "Api::V1::Products", type: :request do
  describe "GET /api/v1/products" do
    let!(:user) { User.create!(name: "販売者", email: "seller@example.com", password: "password123") }

    context "商品が存在する場合" do
      before do
        Product.create!(name: "商品A", description: "説明A", price: 1000, user: user)
        Product.create!(name: "商品B", description: nil, price: 2000, user: user)
      end

      it "200 と商品一覧を返す" do
        get "/api/v1/products", as: :json

        expect(response).to have_http_status(:ok)

        body = JSON.parse(response.body)
        expect(body.length).to eq(2)
        expect(body.first).to include("id", "name", "description", "price", "user_id")
      end
    end

    context "商品が存在しない場合" do
      it "200 と空配列を返す" do
        get "/api/v1/products", as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq([])
      end
    end
  end
end
