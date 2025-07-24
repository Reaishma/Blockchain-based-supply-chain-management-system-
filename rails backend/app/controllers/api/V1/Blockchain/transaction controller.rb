
class Api::V1::Blockchain::TransactionsController < ApplicationController
  before_action :validate_transaction_data, only: [:create]

  def create
    fabric_service = HyperledgerFabricService.instance
    
    case params[:type]
    when 'inventory_update'
      result = fabric_service.submit_transaction(
        'UpdateInventory',
        [
          params[:item_id],
          params[:quantity].to_s,
          params[:location],
          params[:timestamp]
        ]
      )
    when 'demand_forecast'
      result = fabric_service.submit_transaction(
        'RecordDemandForecast',
        [
          params[:product_id],
          params[:forecast_data].to_json,
          params[:accuracy].to_s,
          params[:timestamp]
        ]
      )
    when 'quality_record'
      result = fabric_service.submit_transaction(
        'RecordQualityMetrics',
        [
          params[:batch_id],
          params[:sigma_level].to_s,
          params[:defect_rate].to_s,
          params[:timestamp]
        ]
      )
    when 'supplier_transaction'
      result = fabric_service.submit_transaction(
        'RecordSupplierTransaction',
        [
          params[:supplier_id],
          params[:transaction_data].to_json,
          params[:timestamp]
        ]
      )
    else
      render json: { error: 'Invalid transaction type' }, status: :bad_request
      return
    end

    if result[:success]
      render json: {
        success: true,
        transaction_id: result[:transaction_id],
        block_number: result[:block_number],
        timestamp: result[:timestamp],
        message: 'Transaction successfully recorded on blockchain'
      }, status: :created
    else
      render json: {
        success: false,
        error: result[:error],
        message: 'Failed to record transaction on blockchain'
      }, status: :unprocessable_entity
    end
  end

  private

  def validate_transaction_data
    required_fields = %w[type timestamp]
    
    missing_fields = required_fields.select { |field| params[field].blank? }
    
    if missing_fields.any?
      render json: {
        error: "Missing required fields: #{missing_fields.join(', ')}"
      }, status: :bad_request
    end
  end
end
