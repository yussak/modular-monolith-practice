class CreateCoupons < ActiveRecord::Migration[8.1]
  def change
    create_table :coupons do |t|
      t.references :product, null: false, foreign_key: true
      t.string :code, null: false
      t.string :discount_type, null: false
      t.integer :discount_value, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :coupons, :code, unique: true
  end
end
