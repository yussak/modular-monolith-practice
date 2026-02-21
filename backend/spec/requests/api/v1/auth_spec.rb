require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    context "正常系" do
      it "201 と token を返す" do
        post "/api/v1/auth/register", params: { email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)).to have_key("token")
      end
    end

    context "異常系" do
      it "メール重複のとき 422 を返す" do
        User.create!(email: "test@example.com", password: "password123")
        post "/api/v1/auth/register", params: { email: "test@example.com", password: "password123" }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "POST /api/v1/auth/login" do
    before { User.create!(email: "test@example.com", password: "password123") }

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
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "200 を返す" do
      delete "/api/v1/auth/logout", as: :json
      expect(response).to have_http_status(:ok)
    end
  end

end
