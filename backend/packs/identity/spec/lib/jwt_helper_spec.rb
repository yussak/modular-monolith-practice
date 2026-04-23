require "rails_helper"

RSpec.describe JwtHelper do
  describe ".encode / .decode" do
    it "encode したトークンを decode できる" do
      payload = { user_id: 1 }
      token = JwtHelper.encode(payload)
      decoded = JwtHelper.decode(token)
      expect(decoded[:user_id]).to eq 1
    end

    it "不正なトークンは nil を返す" do
      expect(JwtHelper.decode("invalid.token")).to be_nil
    end

    it "改ざんされたトークンは nil を返す" do
      token = JwtHelper.encode({ user_id: 1 })
      tampered = token + "tampered"
      expect(JwtHelper.decode(tampered)).to be_nil
    end
  end
end
