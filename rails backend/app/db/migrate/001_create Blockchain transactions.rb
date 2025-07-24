
class CreateBlockchainTransactions < ActiveRecord::Migration[7.0]
  def change
    create_table :blockchain_transactions do |t|
      t.string :transaction_id, null: false, index: { unique: true }
      t.string :transaction_type, null: false
      t.text :data, null: false
      t.text :fabric_response
      t.integer :status, default: 0
      t.timestamps
    end
    
    add_index :blockchain_transactions, :transaction_type
    add_index :blockchain_transactions, :status
    add_index :blockchain_transactions, :created_at
  end
end
