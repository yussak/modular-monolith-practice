class ApplicationController < ActionController::API
  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = JwtHelper.decode(token)
    if payload
      @current_user = User.find_by(id: payload[:user_id])
    end
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end
end
