
class CreateInventoryItems < ActiveRecord::Migration[7.0]
  def change
    create_table :inventory_items do |t|
      t.string :name, null: false
      t.integer :current_stock, default: 0
      t.integer :max_stock, null: false
      t.integer :min_stock, null: false
      t.integer :reorder_point, null: false
      t.string :location
      t.decimal :stock_level, precision: 5, scale: 2
      t.string :blockchain_hash
      t.integer :blockchain_block
      t.text :description

      t.timestamps
    end

    add_index :inventory_items, :name, unique: true
    add_index :inventory_items, :blockchain_hash
    add_index :inventory_items, :current_stock
  end
end
