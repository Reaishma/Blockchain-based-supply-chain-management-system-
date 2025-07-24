
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Supply Chain Management routes
      resources :inventory, only: [:index, :show, :create, :update, :destroy]
      resources :suppliers, only: [:index, :show, :create, :update]
      resources :orders, only: [:index, :show, :create, :update]
      resources :forecasts, only: [:index, :create, :update]
      
      # Blockchain integration routes
      namespace :blockchain do
        post 'transactions', to: 'transactions#create'
        get 'blocks', to: 'blocks#index'
        get 'blocks/:block_id', to: 'blocks#show'
        get 'audit', to: 'audit#index'
        get 'health', to: 'health#check'
      end

      # Analytics and metrics
      get 'analytics/demand_forecast', to: 'analytics#demand_forecast'
      get 'analytics/risk_assessment', to: 'analytics#risk_assessment'
      get 'analytics/six_sigma', to: 'analytics#six_sigma'
      get 'analytics/jit_metrics', to: 'analytics#jit_metrics'
      get 'analytics/tco_analysis', to: 'analytics#tco_analysis'
    end
  end

  root 'health#check'
end
