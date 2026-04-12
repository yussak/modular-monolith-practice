module Api
  module V1
    class CartsController < ApplicationController
      before_action :authenticate_user!

      def show
        cart = @current_user.cart
        if cart
          render json: cart_json(cart)
        else
          render json: { items: [] }
        end
      end

      private

      def cart_json(cart)
        items = cart.cart_items.includes(:product).map do |item|
          {
            id: item.id,
            product_id: item.product.id,
            product_name: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
            product_deleted: item.product.deleted?
          }
        end

        {
          items: items,
          total: items.reject { |i| i[:product_deleted] }.sum { |i| i[:subtotal] }
        }
      end
    end
  end
end
