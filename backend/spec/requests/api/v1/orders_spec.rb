require "rails_helper"

RSpec.describe "Api::V1::Orders", type: :request do
  let!(:user) { User.create!(name: "テストユーザー", email: "user@example.com", password: "password123") }
  let!(:product) { Product.create!(name: "商品A", price: 1000, user: user) }
  let!(:product2) { Product.create!(name: "商品B", price: 2000, user: user) }
  let(:headers) { { "Authorization" => "Bearer #{JwtHelper.encode(user_id: user.id)}" } }

  def auth_header(u)
    { "Authorization" => "Bearer #{JwtHelper.encode(user_id: u.id)}" }
  end

  describe "POST /api/v1/orders" do
    context "カートにアイテムがある場合" do
      before do
        cart = user.create_cart!
        cart.cart_items.create!(product: product, quantity: 2)
        cart.cart_items.create!(product: product2, quantity: 1)
      end

      it "注文が作成され、カートが空になる" do
        post "/api/v1/orders", headers: headers, as: :json

        expect(response).to have_http_status(:created)

        body = JSON.parse(response.body)
        expect(body["order_number"]).to be_present
        expect(body["status"]).to eq("confirmed")
        expect(body["items"].length).to eq(2)
        expect(body["total"]).to eq(4000)

        expect(user.cart.cart_items.count).to eq(0)
      end

      it "注文アイテムにスナップショットが保存される" do
        post "/api/v1/orders", headers: headers, as: :json

        body = JSON.parse(response.body)
        item = body["items"].find { |i| i["product_name"] == "商品A" }
        expect(item["unit_price"]).to eq(1000)
        expect(item["quantity"]).to eq(2)
      end
    end

    context "カートが空の場合" do
      it "422を返す" do
        post "/api/v1/orders", headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "削除済み商品のみの場合" do
      before do
        product.deleted!
        cart = user.create_cart!
        cart.cart_items.create!(product: product, quantity: 1)
      end

      it "422を返す" do
        post "/api/v1/orders", headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "未認証の場合" do
      it "401を返す" do
        post "/api/v1/orders", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/orders/:id/cancel" do
    let!(:order) do
      order = user.orders.create!(order_number: SecureRandom.uuid, status: :confirmed)
      order.order_items.create!(product: product, product_name: "商品A", unit_price: 1000, quantity: 1)
      order
    end

    context "認証済みの場合" do
      it "注文をキャンセルできる" do
        patch "/api/v1/orders/#{order.id}/cancel", headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(order.reload.status).to eq("cancelled")
      end

      it "すでにキャンセル済みなら422を返す" do
        order.cancelled!
        patch "/api/v1/orders/#{order.id}/cancel", headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "他ユーザーの注文はキャンセルできない" do
        other = User.create!(name: "他ユーザー", email: "other@example.com", password: "password123")
        patch "/api/v1/orders/#{order.id}/cancel", headers: auth_header(other), as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "GET /api/v1/orders" do
    before do
      2.times do |i|
        order = user.orders.create!(order_number: SecureRandom.uuid, status: :confirmed)
        order.order_items.create!(product: product, product_name: "商品A", unit_price: 1000, quantity: i + 1)
      end
    end

    it "注文一覧を返す" do
      get "/api/v1/orders", headers: headers, as: :json

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body.length).to eq(2)
      expect(body.first).to include("order_number", "status", "total", "created_at")
    end

    it "未認証なら401を返す" do
      get "/api/v1/orders", as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/orders/:id" do
    let!(:order) do
      order = user.orders.create!(order_number: SecureRandom.uuid, status: :confirmed)
      order.order_items.create!(product: product, product_name: "商品A", unit_price: 1000, quantity: 2)
      order
    end

    it "注文詳細を返す" do
      get "/api/v1/orders/#{order.id}", headers: headers, as: :json

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["order_number"]).to eq(order.order_number)
      expect(body["items"].length).to eq(1)
      expect(body["items"].first["product_name"]).to eq("商品A")
      expect(body["total"]).to eq(2000)
    end

    it "他ユーザーの注文は404を返す" do
      other = User.create!(name: "他ユーザー", email: "other@example.com", password: "password123")
      get "/api/v1/orders/#{order.id}", headers: auth_header(other), as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "未認証なら401を返す" do
      get "/api/v1/orders/#{order.id}", as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
