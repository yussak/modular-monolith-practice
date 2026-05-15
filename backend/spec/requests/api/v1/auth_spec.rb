require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    context "正常系" do
      it "201 と token を返す" do
        post "/api/v1/auth/register", params: { name: "テスト", email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)).to have_key("token")
      end
    end

    context "異常系" do
      it "メール重複のとき 422 を返す" do
        User.create!(name: "テスト", email: "test@example.com", password: "password123")
        post "/api/v1/auth/register", params: { name: "テスト2", email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "メール形式が不正なとき 422 を返す" do
        post "/api/v1/auth/register", params: { name: "テスト", email: "invalid-email", password: "password123" }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "name が空のとき 422 を返す" do
        post "/api/v1/auth/register", params: { name: "", email: "x@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "password が空のとき 422 を返す" do
        post "/api/v1/auth/register", params: { name: "テスト", email: "x@example.com", password: "" }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "POST /api/v1/auth/login" do
    before { User.create!(name: "テスト", email: "test@example.com", password: "password123") }

    context "正常系" do
      it "200 と token を返す" do
        post "/api/v1/auth/login", params: { email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to have_key("token")
      end
    end

    context "異常系" do
      it "不正なパスワードのとき 401 を返す" do
        post "/api/v1/auth/login", params: { email: "test@example.com", password: "wrong" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "存在しないメールアドレスのとき 401 を返す" do
        post "/api/v1/auth/login", params: { email: "notfound@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "認証が必要なエンドポイント" do
    it "不正なトークンなら 401 を返す" do
      get "/api/v1/cart", headers: { "Authorization" => "Bearer invalid.token.here" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "Bearer プレフィックスなしでも decode 失敗で 401 を返す" do
      get "/api/v1/cart", headers: { "Authorization" => "someinvalidtoken" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "期限切れトークンなら 401 を返す" do
      user = User.create!(name: "テスト", email: "expired@example.com", password: "password123")
      expired_token = JWT.encode(
        { user_id: user.id, exp: 1.hour.ago.to_i },
        Rails.application.secret_key_base,
        "HS256"
      )
      get "/api/v1/cart", headers: { "Authorization" => "Bearer #{expired_token}" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "200 を返す" do
      delete "/api/v1/auth/logout", as: :json
      expect(response).to have_http_status(:ok)
    end
  end
end
