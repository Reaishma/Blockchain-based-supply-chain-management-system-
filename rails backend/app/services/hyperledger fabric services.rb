
require 'rest-client'
require 'json'
require 'digest'

class HyperledgerFabricService
  include Singleton

  def initialize
    @network_url = Rails.application.config.hyperledger[:network_url]
    @channel_name = Rails.application.config.hyperledger[:channel_name]
    @chaincode_name = Rails.application.config.hyperledger[:chaincode_name]
    @wallet_path = Rails.application.config.hyperledger[:wallet_path]
  end

  def submit_transaction(function_name, args = [])
    begin
      transaction_data = {
        channel: @channel_name,
        chaincode: @chaincode_name,
        function: function_name,
        args: args,
        timestamp: Time.current.iso8601
      }

      # Generate transaction ID
      transaction_id = generate_transaction_id(transaction_data)
      
      # Submit to Hyperledger Fabric network
      response = RestClient.post(
        "#{@network_url}/api/v1/channels/#{@channel_name}/chaincodes/#{@chaincode_name}",
        transaction_data.to_json,
        {
          content_type: :json,
          accept: :json,
          'X-Transaction-ID' => transaction_id
        }
      )

      result = JSON.parse(response.body)
      
      {
        success: true,
        transaction_id: transaction_id,
        block_number: result['block_number'],
        timestamp: Time.current,
        data: result
      }
    rescue => e
      Rails.logger.error "Hyperledger Fabric transaction failed: #{e.message}"
      {
        success: false,
        error: e.message,
        timestamp: Time.current
      }
    end
  end

  def query_blockchain(function_name, args = [])
    begin
      query_data = {
        channel: @channel_name,
        chaincode: @chaincode_name,
        function: function_name,
        args: args
      }

      response = RestClient.get(
        "#{@network_url}/api/v1/channels/#{@channel_name}/chaincodes/#{@chaincode_name}",
        {
          params: query_data,
          accept: :json
        }
      )

      JSON.parse(response.body)
    rescue => e
      Rails.logger.error "Hyperledger Fabric query failed: #{e.message}"
      { error: e.message }
    end
  end

  def get_block(block_number)
    begin
      response = RestClient.get(
        "#{@network_url}/api/v1/channels/#{@channel_name}/blocks/#{block_number}",
        { accept: :json }
      )
      
      JSON.parse(response.body)
    rescue => e
      Rails.logger.error "Failed to retrieve block #{block_number}: #{e.message}"
      { error: e.message }
    end
  end

  def get_transaction_history(asset_id)
    query_blockchain('GetAssetHistory', [asset_id])
  end

  def network_health
    begin
      response = RestClient.get("#{@network_url}/health", { accept: :json })
      JSON.parse(response.body)
    rescue => e
      { status: 'unhealthy', error: e.message }
    end
  end

  private

  def generate_transaction_id(data)
    Digest::SHA256.hexdigest("#{data.to_json}#{Time.current.to_f}")
  end
end
