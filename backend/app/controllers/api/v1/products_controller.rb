module Api
  module V1
    class ProductsController < ApplicationController
      def index
        products = Product.all
        render json: products
      end

      def show
        product = Product.find(params[:id])
        render json: product
      rescue ActiveRecord::RecordNotFound
        render json: { error: "商品が見つかりません" }, status: :not_found
      end
    end
  end
end
