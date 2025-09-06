
# Blockchain-Based Supply Chain Management Dashboard

A comprehensive supply chain management system built with blockchain technology for secure, transparent, and immutable data storage. This project combines a modern Angular frontend with a Ruby on Rails backend, all secured by Hyperledger Fabric blockchain platform.


![Overview](https://github.com/Reaishma/Blockchain-based-supply-chain-management-system-/blob/main/chrome_screenshot_Sep%206%2C%202025%2011_10_33%20AM%20GMT%2B05_30.png)

# 🚀 Live Demo 
**View live demo** https://reaishma.github.io/Blockchain-based-supply-chain-management-system-/


## 🏗️ Architecture

### Frontend
- **Angular 17.1.0** - Modern TypeScript-based frontend framework
- **Responsive Design** - Mobile-first approach with CSS Grid and Flexbox
- **Real-time Dashboard** - Interactive charts and live data updates
- **Blockchain Integration** - Direct interaction with Hyperledger Fabric network

### Backend
- **Ruby on Rails** - RESTful API backend for business logic
- **Hyperledger Fabric** - Enterprise blockchain platform for data integrity
- **Smart Contracts** - Chaincode for supply chain operations
- **Secure Data Storage** - Immutable blockchain records

### Blockchain Platform
- **Hyperledger Fabric** - Permissioned blockchain network
- **Peer Nodes** - Distributed ledger maintenance
- **Ordering Service** - Transaction ordering and block creation
- **Certificate Authority** - Identity and access management


## 🚀 Features

### Core Supply Chain Modules
- **🔗 Blockchain Demand Forecasting** - AI-powered demand prediction with blockchain verification
- **⚠️ Blockchain Risk Management** - Real-time risk assessment and mitigation
- **📊 Blockchain Six Sigma** - Quality management with immutable records
- **🏭 Blockchain Lean Management** - Process optimization tracking
- **🤝 Supply Relationship Management** - Vendor performance monitoring
- **💰 Total Cost of Ownership** - Comprehensive cost analysis
- **📦 Vendor Managed Inventory** - Automated inventory management
- **⚡ Just in Time Production** - Optimized production scheduling
- **Real-time Monitoring**: Monitor supply chain data in real-time, with blockchain-secured storage

### Blockchain Security Features
- **Immutable Data Storage** - All transactions recorded on blockchain
- **Digital Signatures** - Cryptographic verification of all operations
- **Access Control** - Role-based permissions via Hyperledger Fabric
- **Audit Trail** - Complete transaction history
- **Smart Contracts** - Automated business rule enforcement
- **Blockchain-based Data Integrity**: Ensure data integrity and transparency through blockchain technology
- **Secure Data Storage**: Store data securely on the blockchain, with access controls and encryption

## 🛠️ Technology Stack

```
Frontend:
├── Angular 17.1.0
├── TypeScript 5.3.2
├── RxJS 7.8.0
├── CSS3 (Grid & Flexbox)
└── Chart.js for data visualization

Backend:
├── Ruby on Rails 7.x
├── PostgreSQL Database
├── Redis for caching
└── RESTful API design

Blockchain:
├── Hyperledger Fabric 2.x
├── Node.js SDK
├── CouchDB for state database
└── Docker containers for network
```

## 📋 Prerequisites

- Node.js 18+ and npm
- Ruby 3.0+
- Docker and Docker Compose
- Hyperledger Fabric binaries
- Git

## 🚀 Development Server

### Frontend (Angular)
```bash
npm install
ng serve --host 0.0.0.0
```
Navigate to `http://localhost:4200/` for the Angular frontend.

### Backend (Ruby on Rails)
```bash
bundle install
rails db:create db:migrate
rails server -b 0.0.0.0 -p 5000
```
API will be available at `http://localhost:5000/`

### Blockchain Network (Hyperledger Fabric)
```bash
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn scm -ccp ./chaincode/scm/ -ccl javascript
```

## 🏗️ Project Structure

```
├── src/                          # Angular frontend source
│   ├── app/                      # Angular components and services
│   ├── assets/                   # Static assets
│   └── environments/             # Environment configurations
├── backend/                      # Ruby on Rails API
│   ├── app/                      # Rails MVC structure
│   ├── config/                   # Database and API configurations
│   └── db/                       # Database migrations and seeds
├── blockchain/                   # Hyperledger Fabric network
│   ├── chaincode/                # Smart contracts
│   ├── network/                  # Network configuration
│   └── scripts/                  # Deployment scripts
├── blockchain-scm-dashboard.html # Standalone demo
└── README.md
```

## 🔧 Build & Deployment

### Production Build
```bash
# Frontend
ng build --configuration production

# Backend
RAILS_ENV=production rails assets:precompile
RAILS_ENV=production rails db:migrate

# Blockchain Network
./network.sh up createChannel -ca -s couchdb -i 2.2
```

### Running Tests
```bash
# Frontend tests
ng test

# Backend tests
rails test

# Integration tests
ng e2e
```

## 📊 API Endpoints

### Supply Chain Operations
- `GET /api/v1/inventory` - Retrieve inventory data
- `POST /api/v1/orders` - Create new orders
- `GET /api/v1/suppliers` - Supplier information
- `PUT /api/v1/forecasts` - Update demand forecasts

### Blockchain Integration
- `POST /api/v1/blockchain/transactions` - Submit blockchain transactions
- `GET /api/v1/blockchain/blocks` - Retrieve block data
- `GET /api/v1/blockchain/audit` - Audit trail queries

## 🔐 Security Features

- **Multi-signature Transactions** - Required approvals for critical operations
- **Role-based Access Control** - Granular permissions via Hyperledger Fabric
- **Data Encryption** - End-to-end encryption for sensitive data
- **Smart Contract Validation** - Automated business rule enforcement
- **Immutable Audit Logs** - Complete transaction history on blockchain

## 🌐 Deployment on Replit

This project is optimized for deployment on Replit platform:

1. **Frontend**: Served via Angular development server
2. **Backend**: Rails API with PostgreSQL database
3. **Blockchain**: Containerized Hyperledger Fabric network
4. **Integration**: Real-time data synchronization between all layers

## 📈 Monitoring & Analytics

- Real-time dashboard with live metrics
- Blockchain transaction monitoring
- Supply chain KPI tracking
- Performance analytics and reporting
- Automated alert system for critical events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` folder

## 🔮 Roadmap

- [ ] Advanced AI/ML integration for predictive analytics
- [ ] Multi-chain interoperability
- [ ] IoT device integration
- [ ] Advanced reporting and analytics
- [ ] Mobile application development
- [ ] Integration with enterprise ERP systems

---

**Built with ❤️ using Angular, Ruby on Rails, and Hyperledger Fabric**







https://reaishma.github.io/Blockchain-based-supply-chain-management-system-/
