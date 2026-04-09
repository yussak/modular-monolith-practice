class AddStatusToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :status, :string, null: false, default: "active"
  end
end
