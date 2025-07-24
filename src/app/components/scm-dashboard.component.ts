
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockchainApiService, InventoryItem } from '../services/blockchain-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scm-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scm-dashboard">
      <header class="dashboard-header">
        <h1>🔗 Blockchain-Based Supply Chain Management</h1>
        <p>Real-time monitoring with Ruby on Rails backend and Hyperledger Fabric</p>
        <div class="network-status" [ngClass]="networkStatus.status">
          <span>Network: {{ networkStatus.status | titlecase }}</span>
          <div class="status-indicator"></div>
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Inventory Management Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📦 Blockchain Inventory Management</h3>
            <button class="btn btn-primary" (click)="refreshInventory()">Refresh</button>
          </div>
          <div class="card-content">
            <div class="inventory-form">
              <div class="form-group">
                <label>Item Name:</label>
                <input [(ngModel)]="newItem.name" placeholder="Enter item name">
              </div>
              <div class="form-group">
                <label>Current Stock:</label>
                <input type="number" [(ngModel)]="newItem.current_stock" placeholder="Current stock">
              </div>
              <div class="form-group">
                <label>Max Stock:</label>
                <input type="number" [(ngModel)]="newItem.max_stock" placeholder="Maximum stock">
              </div>
              <div class="form-group">
                <label>Min Stock:</label>
                <input type="number" [(ngModel)]="newItem.min_stock" placeholder="Minimum stock">
              </div>
              <div class="form-group">
                <label>Reorder Point:</label>
                <input type="number" [(ngModel)]="newItem.reorder_point" placeholder="Reorder point">
              </div>
              <button class="btn btn-success" (click)="addInventoryItem()">Add to Blockchain</button>
            </div>

            <div class="inventory-list">
              <h4>Current Inventory</h4>
              <div class="inventory-items">
                <div *ngFor="let item of inventoryItems" class="inventory-item" [ngClass]="item.status">
                  <div class="item-details">
                    <h5>{{ item.name }}</h5>
                    <p>Stock: {{ item.current_stock }}/{{ item.max_stock }}</p>
                    <p>Status: <span class="status-badge" [ngClass]="'status-' + item.status">{{ item.status }}</span></p>
                    <p>Blockchain: <span class="blockchain-status" [ngClass]="{'verified': item.blockchain_verified}">
                      {{ item.blockchain_verified ? '✓ Verified' : '⏳ Pending' }}
                    </span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Demand Forecasting Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📈 Blockchain Demand Forecasting</h3>
          </div>
          <div class="card-content">
            <div class="forecast-form">
              <div class="form-group">
                <label>Historical Sales (comma-separated):</label>
                <input [(ngModel)]="forecastData.historicalSales" 
                       placeholder="1000,1200,1100,1300...">
              </div>
              <div class="form-group">
                <label>Seasonal Factor:</label>
                <input type="number" step="0.01" [(ngModel)]="forecastData.seasonalFactor" 
                       placeholder="1.15">
              </div>
              <div class="form-group">
                <label>Growth Rate (%):</label>
                <input type="number" step="0.1" [(ngModel)]="forecastData.growthRate" 
                       placeholder="5.2">
              </div>
              <button class="btn btn-primary" (click)="calculateForecast()">Calculate & Store on Blockchain</button>
            </div>

            <div class="forecast-results" *ngIf="forecastResults">
              <h4>Forecast Results</h4>
              <div class="metrics">
                <div class="metric">
                  <span>Next Month Demand:</span>
                  <span class="value">{{ forecastResults.nextMonthDemand | number }} units</span>
                </div>
                <div class="metric">
                  <span>Accuracy:</span>
                  <span class="value">{{ forecastResults.accuracy }}%</span>
                </div>
                <div class="metric">
                  <span>Blockchain Hash:</span>
                  <span class="value">{{ formatHash(forecastResults.blockchainHash) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quality Management Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📊 Blockchain Six Sigma Quality</h3>
          </div>
          <div class="card-content">
            <div class="quality-form">
              <div class="form-group">
                <label>Total Units Produced:</label>
                <input type="number" [(ngModel)]="qualityData.totalUnits" placeholder="10000">
              </div>
              <div class="form-group">
                <label>Defective Units:</label>
                <input type="number" [(ngModel)]="qualityData.defectiveUnits" placeholder="30">
              </div>
              <div class="form-group">
                <label>Process Opportunities:</label>
                <input type="number" [(ngModel)]="qualityData.processOpportunities" placeholder="5">
              </div>
              <button class="btn btn-primary" (click)="calculateQuality()">Calculate & Record on Blockchain</button>
            </div>

            <div class="quality-results" *ngIf="qualityResults">
              <h4>Quality Metrics</h4>
              <div class="metrics">
                <div class="metric">
                  <span>Sigma Level:</span>
                  <span class="value">{{ qualityResults.sigmaLevel }}</span>
                </div>
                <div class="metric">
                  <span>Defect Rate:</span>
                  <span class="value">{{ qualityResults.defectRate }}%</span>
                </div>
                <div class="metric">
                  <span>Performance:</span>
                  <span class="value">{{ qualityResults.performance }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Blockchain Status Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🔗 Blockchain Network Status</h3>
            <button class="btn btn-secondary" (click)="refreshBlockchainData()">Refresh</button>
          </div>
          <div class="card-content">
            <div class="blockchain-info">
              <div class="metric">
                <span>Network Status:</span>
                <span class="value" [ngClass]="networkStatus.status">{{ networkStatus.status | titlecase }}</span>
              </div>
              <div class="metric">
                <span>Total Blocks:</span>
                <span class="value">{{ blockchainData.totalBlocks || 0 }}</span>
              </div>
              <div class="metric">
                <span>Last Block Time:</span>
                <span class="value">{{ blockchainData.lastBlockTime | date:'short' }}</span>
              </div>
              <div class="metric">
                <span>Active Peers:</span>
                <span class="value">{{ blockchainData.activePeers || 1 }}</span>
              </div>
            </div>

            <div class="recent-transactions" *ngIf="recentTransactions.length > 0">
              <h4>Recent Transactions</h4>
              <div class="transaction-list">
                <div *ngFor="let tx of recentTransactions.slice(0, 5)" class="transaction-item">
                  <span class="tx-type">{{ tx.type | titlecase }}</span>
                  <span class="tx-time">{{ tx.timestamp | date:'short' }}</span>
                  <span class="tx-status success">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./scm-dashboard.component.css']
})
export class ScmDashboardComponent implements OnInit, OnDestroy {
  inventoryItems: InventoryItem[] = [];
  networkStatus: any = { status: 'connecting' };
  blockchainData: any = {};
  recentTransactions: any[] = [];
  
  newItem: Partial<InventoryItem> = {
    name: '',
    current_stock: 0,
    max_stock: 0,
    min_stock: 0,
    reorder_point: 0
  };

  forecastData = {
    historicalSales: '1000,1200,1100,1300,1250,1400,1350,1500',
    seasonalFactor: 1.15,
    growthRate: 5.2
  };

  qualityData = {
    totalUnits: 10000,
    defectiveUnits: 30,
    processOpportunities: 5
  };

  forecastResults: any = null;
  qualityResults: any = null;

  private subscriptions: Subscription[] = [];

  constructor(private blockchainApi: BlockchainApiService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.blockchainApi.networkStatus$.subscribe(status => {
        this.networkStatus = status;
      })
    );

    this.refreshInventory();
    this.refreshBlockchainData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshInventory() {
    this.blockchainApi.getInventory().subscribe({
      next: (items) => {
        this.inventoryItems = items;
      },
      error: (error) => {
        console.error('Failed to load inventory:', error);
      }
    });
  }

  addInventoryItem() {
    if (!this.newItem.name || this.newItem.current_stock === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    this.blockchainApi.createInventoryItem(this.newItem).subscribe({
      next: (response) => {
        alert('Item added to blockchain successfully!');
        this.refreshInventory();
        this.resetNewItem();
        
        // Add to recent transactions
        this.recentTransactions.unshift({
          type: 'inventory_creation',
          timestamp: new Date().toISOString(),
          status: 'success'
        });
      },
      error: (error) => {
        alert('Failed to add item: ' + error.message);
      }
    });
  }

  calculateForecast() {
    if (!this.forecastData.historicalSales) {
      alert('Please enter historical sales data');
      return;
    }

    const salesArray = this.forecastData.historicalSales.split(',').map(s => parseFloat(s.trim()));
    const avgSales = salesArray.reduce((sum, val) => sum + val, 0) / salesArray.length;
    const nextMonthDemand = Math.round(avgSales * this.forecastData.seasonalFactor * (1 + this.forecastData.growthRate / 100));
    
    const variance = salesArray.reduce((sum, val) => sum + Math.pow(val - avgSales, 2), 0) / salesArray.length;
    const standardDeviation = Math.sqrt(variance);
    const accuracy = Math.max(70, 100 - (standardDeviation / avgSales * 100)).toFixed(1);

    const forecastData = {
      historicalSales: salesArray,
      nextMonthDemand: nextMonthDemand,
      accuracy: accuracy
    };

    this.blockchainApi.submitDemandForecast(forecastData).subscribe({
      next: (response) => {
        this.forecastResults = {
          nextMonthDemand: nextMonthDemand,
          accuracy: accuracy,
          blockchainHash: response.transaction_id
        };

        this.recentTransactions.unshift({
          type: 'demand_forecast',
          timestamp: new Date().toISOString(),
          status: 'success'
        });
      },
      error: (error) => {
        alert('Failed to record forecast on blockchain: ' + error.message);
      }
    });
  }

  calculateQuality() {
    if (this.qualityData.totalUnits === 0) {
      alert('Total units must be greater than 0');
      return;
    }

    const defectRate = (this.qualityData.defectiveUnits / this.qualityData.totalUnits) * 100;
    const dpo = this.qualityData.defectiveUnits / (this.qualityData.totalUnits * this.qualityData.processOpportunities);
    const dpmo = dpo * 1000000;

    let sigmaLevel = 6;
    if (dpmo > 66807) sigmaLevel = 3;
    else if (dpmo > 6210) sigmaLevel = 4;
    else if (dpmo > 233) sigmaLevel = 5;

    let performance = 'Excellent';
    if (sigmaLevel < 4) performance = 'Poor';
    else if (sigmaLevel < 5) performance = 'Good';

    const qualityData = {
      sigmaLevel: sigmaLevel,
      defectRate: defectRate.toFixed(3)
    };

    this.blockchainApi.submitQualityMetrics(qualityData).subscribe({
      next: (response) => {
        this.qualityResults = {
          sigmaLevel: sigmaLevel.toFixed(1),
          defectRate: defectRate.toFixed(3),
          performance: performance
        };

        this.recentTransactions.unshift({
          type: 'quality_record',
          timestamp: new Date().toISOString(),
          status: 'success'
        });
      },
      error: (error) => {
        alert('Failed to record quality metrics on blockchain: ' + error.message);
      }
    });
  }

  refreshBlockchainData() {
    this.blockchainApi.getBlockchainBlocks(10).subscribe({
      next: (data) => {
        this.blockchainData = {
          totalBlocks: data.total_count || 0,
          lastBlockTime: new Date(),
          activePeers: 1
        };
      },
      error: (error) => {
        console.error('Failed to load blockchain data:', error);
      }
    });
  }

  formatHash(hash: string): string {
    return this.blockchainApi.formatBlockchainHash(hash);
  }

  private resetNewItem() {
    this.newItem = {
      name: '',
      current_stock: 0,
      max_stock: 0,
      min_stock: 0,
      reorder_point: 0
    };
  }
}
