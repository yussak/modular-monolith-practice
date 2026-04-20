require "rails_helper"

# モジュラーモノリス化後も「外から見た振る舞い」が変わらないことを保証するための
# クロスモジュール結合シナリオ。Cart × Product × Coupon × Order にまたがる挙動を固定する。
RSpec.describe "Checkout flow", type: :request do
  let!(:buyer) { create(:user) }
  let!(:seller) { create(:user) }
  let!(:product) { create(:product, user: seller, price: 1000) }
  let!(:other_product) { create(:product, user: seller, price: 500) }

  def auth_header(user)
    { "Authorization" => "Bearer #{JwtHelper.encode(user_id: user.id)}" }
  end

  describe "カート投入から注文確定まで" do
    it "カートに追加 → 一覧取得 → 注文確定 → カートが空になる" do
      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)

      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)

      post "/api/v1/cart/items", params: { product_id: other_product.id }, headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)

      get "/api/v1/cart", headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["items"].length).to eq(2)
      expect(body["total"]).to eq(1000 * 2 + 500)

      post "/api/v1/orders", headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)
      order_body = JSON.parse(response.body)
      expect(order_body["status"]).to eq("confirmed")
      expect(order_body["total"]).to eq(2500)

      get "/api/v1/cart", headers: auth_header(buyer), as: :json
      expect(JSON.parse(response.body)["items"]).to eq([])
    end
  end

  describe "クーポン適用 → キャンセル → 同クーポン再利用" do
    let!(:coupon) do
      create(:coupon, product: product, code: "REUSE001", discount_type: :fixed, discount_value: 300)
    end

    it "キャンセル後に同じユーザーが同じクーポンを再度使える" do
      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      post "/api/v1/orders", params: { coupon_code: "REUSE001" }, headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)
      first_order = JSON.parse(response.body)
      expect(first_order["discount_amount"]).to eq(300)
      expect(CouponUse.count).to eq(1)

      patch "/api/v1/orders/#{first_order["id"]}/cancel", headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["status"]).to eq("cancelled")
      expect(CouponUse.count).to eq(0)

      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      post "/api/v1/orders", params: { coupon_code: "REUSE001" }, headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["discount_amount"]).to eq(300)
    end
  end

  describe "注文確定前に商品が削除された場合" do
    it "削除済み商品はカートに残るが注文から除外される" do
      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      post "/api/v1/cart/items", params: { product_id: other_product.id }, headers: auth_header(buyer), as: :json

      product.deleted!

      get "/api/v1/cart", headers: auth_header(buyer), as: :json
      body = JSON.parse(response.body)
      deleted_item = body["items"].find { |i| i["product_id"] == product.id }
      expect(deleted_item["product_deleted"]).to be true
      expect(body["total"]).to eq(500)

      post "/api/v1/orders", headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:created)
      order_body = JSON.parse(response.body)
      expect(order_body["items"].length).to eq(1)
      expect(order_body["items"].first["product_name"]).to eq(other_product.name)
    end

    it "全商品が削除済みなら注文できない" do
      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      product.deleted!

      post "/api/v1/orders", headers: auth_header(buyer), as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "注文確定時点のスナップショット" do
    it "注文後に商品価格が変わっても注文履歴は影響を受けない" do
      post "/api/v1/cart/items", params: { product_id: product.id }, headers: auth_header(buyer), as: :json
      post "/api/v1/orders", headers: auth_header(buyer), as: :json
      order_id = JSON.parse(response.body)["id"]

      product.update!(price: 9999, name: "別名に変更")

      get "/api/v1/orders/#{order_id}", headers: auth_header(buyer), as: :json
      body = JSON.parse(response.body)
      item = body["items"].first
      expect(item["unit_price"]).to eq(1000)
      expect(item["product_name"]).not_to eq("別名に変更")
    end
  end
end
