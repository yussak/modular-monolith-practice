module Api
  module V1
    class ProductsController < ApplicationController
      before_action :authenticate_user!, only: [:create]

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

      def create
        product = @current_user.products.new(product_params)
        if product.save
          render json: product, status: :created
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def product_params
        params.permit(:name, :description, :price)
      end
    end
  end
end
