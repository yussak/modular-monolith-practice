module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!

      def index
        orders = @current_user.orders.order(created_at: :desc)
        render json: orders.map { |order| order_summary_json(order) }
      end

      def show
        order = @current_user.orders.find(params[:id])
        render json: order_detail_json(order)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "注文が見つかりません" }, status: :not_found
      end

      def create
        cart = @current_user.cart
        if cart.nil? || cart.cart_items.empty?
          return render json: { error: "カートが空です" }, status: :unprocessable_entity
        end

        active_items = cart.cart_items.includes(:product).select { |item| item.product.active? }
        if active_items.empty?
          return render json: { error: "注文可能な商品がありません" }, status: :unprocessable_entity
        end

        order = nil
        ActiveRecord::Base.transaction do
          order = @current_user.orders.create!(
            order_number: SecureRandom.uuid,
            status: :confirmed
          )

          active_items.each do |cart_item|
            order.order_items.create!(
              product: cart_item.product,
              product_name: cart_item.product.name,
              unit_price: cart_item.product.price,
              quantity: cart_item.quantity
            )
          end

          cart.cart_items.destroy_all
        end

        render json: order_detail_json(order), status: :created
      end

      def cancel
        order = @current_user.orders.find(params[:id])

        if order.cancelled?
          return render json: { error: "すでにキャンセル済みです" }, status: :unprocessable_entity
        end

        order.cancelled!
        render json: order_detail_json(order)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "注文が見つかりません" }, status: :not_found
      end

      private

      def order_summary_json(order)
        {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.order_items.sum { |item| item.unit_price * item.quantity },
          created_at: order.created_at
        }
      end

      def order_detail_json(order)
        items = order.order_items.includes(:product).map do |item|
          {
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.unit_price * item.quantity
          }
        end

        {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          items: items,
          total: items.sum { |i| i[:subtotal] },
          created_at: order.created_at
        }
      end
    end
  end
end
