module Api
  module V1
    class AuthController < ApplicationController
      def register
        user = User.new(email: params[:email], password: params[:password])
        if user.save
          token = JwtHelper.encode({ user_id: user.id })
          render json: { token: token }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          token = JwtHelper.encode({ user_id: user.id })
          render json: { token: token }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def logout
        render json: {}, status: :ok
      end
    end
  end
end
