require "rails_helper"

RSpec.describe "Api::V1::Products", type: :request do
  let!(:user) { User.create!(name: "販売者", email: "seller@example.com", password: "password123") }

  describe "GET /api/v1/products/:id" do
    let!(:product) { Product.create!(name: "商品A", description: "説明A", price: 1000, user: user) }

    context "商品が存在する場合" do
      it "200 と商品情報を返す" do
        get "/api/v1/products/#{product.id}", as: :json

        expect(response).to have_http_status(:ok)

        body = JSON.parse(response.body)
        expect(body).to include("id" => product.id, "name" => "商品A", "description" => "説明A", "price" => 1000)
      end
    end

    context "存在しない ID の場合" do
      it "404 を返す" do
        get "/api/v1/products/99999", as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE /api/v1/products/:id" do
    let!(:owner) { User.create!(name: "出品者", email: "owner@example.com", password: "password123") }
    let!(:other) { User.create!(name: "他ユーザー", email: "other@example.com", password: "password123") }
    let!(:product) { Product.create!(name: "削除対象商品", description: "説明", price: 1000, user: owner) }

    def auth_header(user)
      token = JwtHelper.encode(user_id: user.id)
      { "Authorization" => "Bearer #{token}" }
    end

    context "出品者本人の場合" do
      it "204 を返し商品が削除される" do
        delete "/api/v1/products/#{product.id}", headers: auth_header(owner), as: :json

        expect(response).to have_http_status(:ok)
        expect(Product.find_by(id: product.id)).to be_nil
      end
    end

    context "他のユーザーの場合" do
      it "403 を返す" do
        delete "/api/v1/products/#{product.id}", headers: auth_header(other), as: :json

        expect(response).to have_http_status(:forbidden)
        expect(Product.find_by(id: product.id)).not_to be_nil
      end
    end

    context "未認証の場合" do
      it "401 を返す" do
        delete "/api/v1/products/#{product.id}", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "存在しない ID の場合" do
      it "404 を返す" do
        delete "/api/v1/products/99999", headers: auth_header(owner), as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "GET /api/v1/products" do
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
