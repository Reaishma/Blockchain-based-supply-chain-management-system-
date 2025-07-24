
require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module SupplyChainBlockchain
  class Application < Rails::Application
    config.load_defaults 7.0
    config.api_only = true
    
    # CORS configuration
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose: ['Authorization']
      end
    end
    
    # Hyperledger Fabric configuration
    config.hyperledger = {
      channel_name: 'supply-chain-channel',
      chaincode_name: 'supply-chain-cc',
      organization: 'Org1MSP',
      user: 'User1'
    }
  end
end
