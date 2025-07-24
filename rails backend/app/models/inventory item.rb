
class InventoryItem < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :current_stock, :max_stock, :min_stock, :reorder_point,
            presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :max_stock, numericality: { greater_than: :min_stock }
  validates :reorder_point, numericality: { greater_than: :min_stock }

  before_save :calculate_stock_level
  after_update :check_reorder_threshold

  def stock_percentage
    return 0 if max_stock == 0
    ((current_stock.to_f / max_stock) * 100).round(2)
  end

  def needs_reorder?
    current_stock <= reorder_point
  end

  def status
    return 'critical' if current_stock <= min_stock
    return 'warning' if needs_reorder?
    'good'
  end

  private

  def calculate_stock_level
    self.stock_level = stock_percentage
  end

  def check_reorder_threshold
    if needs_reorder? && saved_change_to_current_stock?
      # Trigger reorder alert (could be sent to external system)
      Rails.logger.info "REORDER ALERT: #{name} is below reorder point (#{current_stock}/#{reorder_point})"
    end
  end
end
