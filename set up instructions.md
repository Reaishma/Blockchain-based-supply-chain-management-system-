
# Hyperledger Fabric Supply Chain Management Setup

## Prerequisites

1. Docker and Docker Compose
2. Node.js 16+ for Hyperledger Fabric SDK
3. Ruby 3.2+ and Rails 7
4. Go 1.19+ for chaincode development

## Setup Instructions

### 1. Hyperledger Fabric Network

```bash
# Navigate to hyperledger-network directory
cd hyperledger-network

# Generate crypto materials (you'll need fabric-samples)
./network.sh generate

# Start the network
docker-compose up -d

# Create channel
./network.sh createChannel -c supply-chain-channel

# Deploy chaincode
./network.sh deployCC -c supply-chain-channel -ccn supply-chain-cc -ccp ../chaincode/ -ccl go
```

### 2. Ruby on Rails Backend

```bash
# Navigate to rails-backend directory
cd rails-backend

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate

# Start Rails server
rails server -p 3000 -b 0.0.0.0
```

### 3. Frontend Dashboard

Open `blockchain-scm-dashboard.html` in your browser or serve it using a web server.

## Features

- **Hyperledger Fabric Integration**: Enterprise-grade blockchain for immutable data storage
- **Ruby on Rails API**: RESTful backend for blockchain interaction
- **Smart Contracts**: Go-based chaincode for supply chain operations
- **Real-time Dashboard**: Interactive HTML/JS interface
- **Transaction History**: Complete audit trail of all operations

## API Endpoints

- `POST /api/v1/supply_chain/demand_forecast` - Store demand forecasting data
- `POST /api/v1/supply_chain/inventory_management` - Store inventory data
- `POST /api/v1/supply_chain/risk_assessment` - Store risk assessment data
- `GET /api/v1/supply_chain/blockchain_data` - Query blockchain data
- `GET /api/v1/supply_chain/transactions` - Get transaction history

## Security Features

- JWT authentication for API access
- TLS encryption for all Hyperledger Fabric communications
- Immutable data storage on blockchain
- Multi-organization consensus for data integrity
- Complete audit trail for compliance

## Production Deployment

For production deployment on Replit:

1. Use environment variables for sensitive configuration
2. Set up proper SSL/TLS certificates
3. Configure proper network security
4. Implement comprehensive monitoring
5. Set up backup and disaster recovery
