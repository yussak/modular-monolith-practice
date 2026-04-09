class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :order_number, null: false
      t.references :user, null: false, foreign_key: true
      t.string :status, null: false, default: "confirmed"

      t.timestamps
    end

    add_index :orders, :order_number, unique: true
  end
end
