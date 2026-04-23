module Api
  module V1
    class CartItemsController < ApplicationController
      include Authenticatable

      before_action :authenticate_user!

      def create
        cart = Cart.find_or_create_by!(user: @current_user)
        product = Product.active.find(params[:product_id])

        cart_item = cart.cart_items.find_by(product: product)
        if cart_item
          cart_item.increment!(:quantity)
        else
          cart_item = cart.cart_items.create!(product: product, quantity: 1)
        end

        render json: cart_item, status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "商品が見つかりません" }, status: :not_found
      end

      def update
        cart_item = find_cart_item
        cart_item.update!(quantity: params[:quantity].to_i)
        render json: cart_item
      rescue ActiveRecord::RecordNotFound
        render json: { error: "カートアイテムが見つかりません" }, status: :not_found
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def destroy
        cart_item = find_cart_item
        cart_item.destroy!
        render json: {}, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "カートアイテムが見つかりません" }, status: :not_found
      end

      private

      def find_cart_item
        Cart.find_by(user: @current_user)&.cart_items&.find(params[:id]) || raise(ActiveRecord::RecordNotFound)
      end
    end
  end
end
