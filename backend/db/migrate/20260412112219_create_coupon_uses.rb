class CreateCouponUses < ActiveRecord::Migration[8.1]
  def change
    create_table :coupon_uses do |t|
      t.references :coupon, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :order, null: false, foreign_key: true
      t.string :status, null: false, default: "unused"

      t.timestamps
    end

    add_index :coupon_uses, [ :coupon_id, :user_id ], unique: true
  end
end
