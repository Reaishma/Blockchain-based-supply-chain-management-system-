
class Api::V1::Blockchain::BlocksController < ApplicationController
  def index
    fabric_service = HyperledgerFabricService.instance
    
    # Get latest blocks (limit to 50 for performance)
    limit = [params[:limit].to_i, 50].min
    limit = 10 if limit <= 0
    
    blocks = []
    (0...limit).each do |i|
      block = fabric_service.get_block(i)
      blocks << block unless block[:error]
    end

    render json: {
      blocks: blocks,
      total_count: blocks.length,
      network_status: fabric_service.network_health
    }
  end

  def show
    fabric_service = HyperledgerFabricService.instance
    block = fabric_service.get_block(params[:id])

    if block[:error]
      render json: { error: "Block not found: #{block[:error]}" }, status: :not_found
    else
      render json: { block: block }
    end
  end
end
