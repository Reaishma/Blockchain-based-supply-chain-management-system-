
require 'httparty'
require 'json'

class HyperledgerService
  include HTTParty
  
  base_uri 'http://localhost:4000'
  
  def initialize
    @channel_name = Rails.application.config.hyperledger[:channel_name]
    @chaincode_name = Rails.application.config.hyperledger[:chaincode_name]
    @organization = Rails.application.config.hyperledger[:organization]
    @user = Rails.application.config.hyperledger[:user]
  end
  
  def store_demand_forecast(forecast_data)
    invoke_chaincode('StoreDemandForecast', [
      forecast_data[:id],
      forecast_data[:historical_sales].to_json,
      forecast_data[:forecast_accuracy],
      forecast_data[:next_month_demand],
      forecast_data[:confidence_level]
    ])
  end
  
  def store_inventory_data(inventory_data)
    invoke_chaincode('StoreInventoryData', [
      inventory_data[:id],
      inventory_data[:item_name],
      inventory_data[:current_stock],
      inventory_data[:max_stock],
      inventory_data[:min_stock],
      inventory_data[:reorder_point],
      inventory_data[:lead_time],
      inventory_data[:stock_level],
      inventory_data[:status]
    ])
  end
  
  def store_risk_assessment(risk_data)
    invoke_chaincode('StoreRiskAssessment', [
      risk_data[:id],
      risk_data[:supply_risk],
      risk_data[:demand_risk],
      risk_data[:quality_risk],
      risk_data[:financial_risk]
    ])
  end
  
  def query_data(id)
    query_chaincode('QueryData', [id])
  end
  
  def get_all_data(start_key = '', end_key = '')
    query_chaincode('GetAllData', [start_key, end_key])
  end
  
  private
  
  def invoke_chaincode(function_name, args)
    payload = {
      peers: ["peer0.org1.example.com", "peer0.org2.example.com"],
      fcn: function_name,
      args: args,
      chainId: @channel_name,
      chaincodeName: @chaincode_name
    }
    
    response = self.class.post(
      "/channels/#{@channel_name}/chaincodes/#{@chaincode_name}",
      body: payload.to_json,
      headers: {
        'Content-Type' => 'application/json',
        'authorization' => "Bearer #{get_auth_token}"
      }
    )
    
    handle_response(response)
  end
  
  def query_chaincode(function_name, args)
    query_params = {
      peer: "peer0.org1.example.com",
      fcn: function_name,
      args: args.join(',')
    }
    
    response = self.class.get(
      "/channels/#{@channel_name}/chaincodes/#{@chaincode_name}",
      query: query_params,
      headers: {
        'authorization' => "Bearer #{get_auth_token}"
      }
    )
    
    handle_response(response)
  end
  
  def get_auth_token
    payload = {
      username: @user,
      orgName: @organization
    }
    
    response = self.class.post(
      '/users',
      body: payload.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
    
    if response.success?
      JSON.parse(response.body)['token']
    else
      raise "Failed to authenticate with Hyperledger Fabric"
    end
  end
  
  def handle_response(response)
    if response.success?
      JSON.parse(response.body)
    else
      Rails.logger.error "Hyperledger Fabric API Error: #{response.code} - #{response.body}"
      { success: false, error: response.body }
    end
  end
end
