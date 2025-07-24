
class Api::V1::InventoryController < ApplicationController
  before_action :set_inventory_item, only: [:show, :update, :destroy]

  def index
    inventory_items = InventoryItem.all
    
    render json: {
      inventory: inventory_items.map do |item|
        {
          id: item.id,
          name: item.name,
          current_stock: item.current_stock,
          max_stock: item.max_stock,
          min_stock: item.min_stock,
          reorder_point: item.reorder_point,
          status: calculate_status(item),
          last_updated: item.updated_at,
          blockchain_verified: item.blockchain_hash.present?
        }
      end
    }
  end

  def show
    render json: {
      inventory_item: @inventory_item,
      blockchain_history: get_blockchain_history(@inventory_item.id)
    }
  end

  def create
    @inventory_item = InventoryItem.new(inventory_params)
    
    if @inventory_item.save
      # Record on blockchain
      fabric_service = HyperledgerFabricService.instance
      blockchain_result = fabric_service.submit_transaction(
        'CreateInventoryItem',
        [
          @inventory_item.id.to_s,
          @inventory_item.name,
          @inventory_item.current_stock.to_s,
          Time.current.iso8601
        ]
      )

      if blockchain_result[:success]
        @inventory_item.update(
          blockchain_hash: blockchain_result[:transaction_id],
          blockchain_block: blockchain_result[:block_number]
        )
      end

      render json: {
        inventory_item: @inventory_item,
        blockchain_status: blockchain_result[:success] ? 'recorded' : 'failed',
        blockchain_transaction_id: blockchain_result[:transaction_id]
      }, status: :created
    else
      render json: { errors: @inventory_item.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @inventory_item.update(inventory_params)
      # Record update on blockchain
      fabric_service = HyperledgerFabricService.instance
      blockchain_result = fabric_service.submit_transaction(
        'UpdateInventoryItem',
        [
          @inventory_item.id.to_s,
          @inventory_item.current_stock.to_s,
          params[:change_reason] || 'Manual update',
          Time.current.iso8601
        ]
      )

      render json: {
        inventory_item: @inventory_item,
        blockchain_status: blockchain_result[:success] ? 'updated' : 'failed',
        blockchain_transaction_id: blockchain_result[:transaction_id]
      }
    else
      render json: { errors: @inventory_item.errors }, status: :unprocessable_entity
    end
  end

  private

  def set_inventory_item
    @inventory_item = InventoryItem.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Inventory item not found' }, status: :not_found
  end

  def inventory_params
    params.require(:inventory).permit(
      :name, :current_stock, :max_stock, :min_stock, :reorder_point, :location
    )
  end

  def calculate_status(item)
    return 'critical' if item.current_stock <= item.min_stock
    return 'warning' if item.current_stock <= item.reorder_point
    'good'
  end

  def get_blockchain_history(item_id)
    fabric_service = HyperledgerFabricService.instance
    fabric_service.get_transaction_history(item_id.to_s)
  end
end
