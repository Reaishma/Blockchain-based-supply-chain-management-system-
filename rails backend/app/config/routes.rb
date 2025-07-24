
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'supply_chain/demand_forecast', to: 'supply_chain#demand_forecast'
      post 'supply_chain/inventory_management', to: 'supply_chain#inventory_management'
      post 'supply_chain/risk_assessment', to: 'supply_chain#risk_assessment'
      get 'supply_chain/blockchain_data', to: 'supply_chain#blockchain_data'
      get 'supply_chain/blockchain_data/:id', to: 'supply_chain#blockchain_data'
      get 'supply_chain/transactions', to: 'supply_chain#transaction_history'
      
      # Authentication routes
      post 'auth/login', to: 'authentication#login'
      post 'auth/register', to: 'authentication#register'
      get 'auth/profile', to: 'authentication#profile'
    end
  end
  
  # Health check
  get 'health', to: 'application#health'
end
