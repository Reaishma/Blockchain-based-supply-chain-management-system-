
class Api::V1::SupplyChainController < ApplicationController
  before_action :authenticate_request
  
  def demand_forecast
    forecast_data = {
      id: "forecast_#{Time.current.to_i}",
      historical_sales: params[:historical_sales],
      forecast_accuracy: calculate_forecast_accuracy(params[:historical_sales]),
      next_month_demand: calculate_next_month_demand(params[:historical_sales], params[:seasonal_factor], params[:growth_rate]),
      confidence_level: params[:confidence_level] || 85.0
    }
    
    hyperledger_response = hyperledger_service.store_demand_forecast(forecast_data)
    
    if hyperledger_response['success']
      transaction = BlockchainTransaction.create_from_fabric_response(
        hyperledger_response, 'demand_forecast', forecast_data
      )
      
      render json: {
        success: true,
        data: forecast_data,
        transaction_id: transaction.transaction_id,
        blockchain_status: "Data secured on Hyperledger Fabric"
      }
    else
      render json: { success: false, error: hyperledger_response['error'] }, status: :unprocessable_entity
    end
  end
  
  def inventory_management
    inventory_data = {
      id: "inventory_#{Time.current.to_i}",
      item_name: params[:item_name],
      current_stock: params[:current_stock].to_i,
      max_stock: params[:max_stock].to_i,
      min_stock: params[:min_stock].to_i,
      reorder_point: params[:reorder_point].to_i,
      lead_time: params[:lead_time].to_i,
      stock_level: calculate_stock_level(params[:current_stock], params[:max_stock]),
      status: determine_stock_status(params[:current_stock], params[:min_stock], params[:reorder_point])
    }
    
    hyperledger_response = hyperledger_service.store_inventory_data(inventory_data)
    
    if hyperledger_response['success']
      transaction = BlockchainTransaction.create_from_fabric_response(
        hyperledger_response, 'inventory_management', inventory_data
      )
      
      render json: {
        success: true,
        data: inventory_data,
        transaction_id: transaction.transaction_id,
        blockchain_status: "Inventory data secured on Hyperledger Fabric"
      }
    else
      render json: { success: false, error: hyperledger_response['error'] }, status: :unprocessable_entity
    end
  end
  
  def risk_assessment
    risk_data = {
      id: "risk_#{Time.current.to_i}",
      supply_risk: params[:supply_risk].to_f,
      demand_risk: params[:demand_risk].to_f,
      quality_risk: params[:quality_risk].to_f,
      financial_risk: params[:financial_risk].to_f
    }
    
    hyperledger_response = hyperledger_service.store_risk_assessment(risk_data)
    
    if hyperledger_response['success']
      transaction = BlockchainTransaction.create_from_fabric_response(
        hyperledger_response, 'risk_assessment', risk_data
      )
      
      overall_risk = (risk_data[:supply_risk] + risk_data[:demand_risk] + 
                     risk_data[:quality_risk] + risk_data[:financial_risk]) / 4
      
      risk_category = case overall_risk
                     when 0..3.9 then 'Low'
                     when 4..6.9 then 'Medium'
                     else 'High'
                     end
      
      render json: {
        success: true,
        data: risk_data.merge(overall_risk: overall_risk, risk_category: risk_category),
        transaction_id: transaction.transaction_id,
        blockchain_status: "Risk assessment secured on Hyperledger Fabric"
      }
    else
      render json: { success: false, error: hyperledger_response['error'] }, status: :unprocessable_entity
    end
  end
  
  def blockchain_data
    data_id = params[:id]
    
    if data_id
      result = hyperledger_service.query_data(data_id)
    else
      result = hyperledger_service.get_all_data
    end
    
    if result['success'] != false
      render json: { success: true, data: result }
    else
      render json: { success: false, error: result['error'] }, status: :not_found
    end
  end
  
  def transaction_history
    transactions = BlockchainTransaction.recent.limit(50)
    
    render json: {
      success: true,
      transactions: transactions.map do |tx|
        {
          id: tx.id,
          transaction_id: tx.transaction_id,
          type: tx.transaction_type,
          status: tx.status,
          created_at: tx.created_at,
          data: JSON.parse(tx.data)
        }
      end
    }
  end
  
  private
  
  def hyperledger_service
    @hyperledger_service ||= HyperledgerService.new
  end
  
  def calculate_forecast_accuracy(historical_sales)
    return 0 if historical_sales.empty?
    
    # Simple accuracy calculation based on variance
    mean = historical_sales.sum / historical_sales.length.to_f
    variance = historical_sales.map { |x| (x - mean) ** 2 }.sum / historical_sales.length
    coefficient_of_variation = Math.sqrt(variance) / mean
    
    # Convert to accuracy percentage (inverse of CV)
    accuracy = [95 - (coefficient_of_variation * 100), 60].max
    accuracy.round(2)
  end
  
  def calculate_next_month_demand(historical_sales, seasonal_factor, growth_rate)
    return 0 if historical_sales.empty?
    
    recent_average = historical_sales.last(3).sum / 3.0
    trend_adjusted = recent_average * (1 + growth_rate / 100.0)
    seasonal_adjusted = trend_adjusted * seasonal_factor
    
    seasonal_adjusted.round
  end
  
  def calculate_stock_level(current_stock, max_stock)
    ((current_stock.to_f / max_stock.to_f) * 100).round
  end
  
  def determine_stock_status(current_stock, min_stock, reorder_point)
    current = current_stock.to_i
    minimum = min_stock.to_i
    reorder = reorder_point.to_i
    
    if current <= minimum
      'critical'
    elsif current <= reorder
      'low'
    else
      'good'
    end
  end
  
  def authenticate_request
    # Implement JWT authentication here
    header = request.headers['Authorization']
    return render json: { error: 'No authorization header' }, status: :unauthorized unless header
    
    token = header.split(' ').last
    begin
      decoded = JWT.decode(token, Rails.application.secret_key_base)
      @current_user_id = decoded[0]['user_id']
    rescue JWT::DecodeError
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end
end
