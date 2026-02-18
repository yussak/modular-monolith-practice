module Api
  module V1
    class HealthController < ApplicationController
      def index
        render json: { message: "Hello from Rails!", status: "ok" }
      end
    end
  end
end
