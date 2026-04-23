module Api
  module V1
    class ProductsController < ApplicationController
      include Authenticatable

      before_action :authenticate_user!, only: [ :create, :update ]

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

      def destroy
        authenticate_user!
        return if performed?

        product = Product.find(params[:id])
        if product.user_id != @current_user.id
          return render json: { error: "権限がありません" }, status: :forbidden
        end

        product.destroy
        render json: {}, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "商品が見つかりません" }, status: :not_found
      end

      def update
        product = Product.find(params[:id])
        if product.user_id != @current_user.id
          return render json: { error: "権限がありません" }, status: :forbidden
        end

        if product.update(product_params)
          render json: product
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "商品が見つかりません" }, status: :not_found
      end

      def create
        product = Product.new(product_params.merge(user: @current_user))
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
