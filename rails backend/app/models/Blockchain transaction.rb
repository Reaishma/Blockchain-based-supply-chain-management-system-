
class BlockchainTransaction < ApplicationRecord
  validates :transaction_id, presence: true, uniqueness: true
  validates :transaction_type, presence: true
  validates :data, presence: true
  validates :status, inclusion: { in: %w[pending confirmed failed] }
  
  enum status: { pending: 0, confirmed: 1, failed: 2 }
  
  scope :by_type, ->(type) { where(transaction_type: type) }
  scope :recent, -> { order(created_at: :desc) }
  
  def self.create_from_fabric_response(response, type, data)
    create!(
      transaction_id: response['txId'],
      transaction_type: type,
      data: data.to_json,
      fabric_response: response.to_json,
      status: response['success'] ? 'confirmed' : 'failed'
    )
  end
end
