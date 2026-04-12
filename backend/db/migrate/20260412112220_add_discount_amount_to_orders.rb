class AddDiscountAmountToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :discount_amount, :integer, null: false, default: 0
  end
end
