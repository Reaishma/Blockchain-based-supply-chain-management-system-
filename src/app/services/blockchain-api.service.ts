
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface InventoryItem {
  id?: number;
  name: string;
  current_stock: number;
  max_stock: number;
  min_stock: number;
  reorder_point: number;
  status: 'good' | 'warning' | 'critical';
  blockchain_verified: boolean;
}

export interface BlockchainTransaction {
  type: string;
  timestamp: string;
  [key: string]: any;
}

export interface BlockchainResponse {
  success: boolean;
  transaction_id?: string;
  block_number?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainApiService {
  private apiUrl = 'http://0.0.0.0:5000/api/v1';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private networkStatusSubject = new BehaviorSubject<any>({ status: 'connecting' });
  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkNetworkHealth();
    // Check network health every 30 seconds
    setInterval(() => this.checkNetworkHealth(), 30000);
  }

  // Inventory Management
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<{inventory: InventoryItem[]}>(`${this.apiUrl}/inventory`, this.httpOptions)
      .pipe(map(response => response.inventory));
  }

  createInventoryItem(item: Partial<InventoryItem>): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory`, { inventory: item }, this.httpOptions);
  }

  updateInventoryItem(id: number, item: Partial<InventoryItem>, reason?: string): Observable<any> {
    const payload = { inventory: item, change_reason: reason };
    return this.http.put(`${this.apiUrl}/inventory/${id}`, payload, this.httpOptions);
  }

  // Blockchain Transactions
  submitBlockchainTransaction(transaction: BlockchainTransaction): Observable<BlockchainResponse> {
    return this.http.post<BlockchainResponse>(
      `${this.apiUrl}/blockchain/transactions`,
      transaction,
      this.httpOptions
    );
  }

  getBlockchainBlocks(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/blockchain/blocks?limit=${limit}`, this.httpOptions);
  }

  getBlockchainAudit(): Observable<any> {
    return this.http.get(`${this.apiUrl}/blockchain/audit`, this.httpOptions);
  }

  // Analytics Functions
  submitDemandForecast(forecastData: any): Observable<BlockchainResponse> {
    return this.submitBlockchainTransaction({
      type: 'demand_forecast',
      product_id: 'PRODUCT_001',
      forecast_data: forecastData,
      accuracy: forecastData.accuracy,
      timestamp: new Date().toISOString()
    });
  }

  submitQualityMetrics(qualityData: any): Observable<BlockchainResponse> {
    return this.submitBlockchainTransaction({
      type: 'quality_record',
      batch_id: `BATCH_${Date.now()}`,
      sigma_level: qualityData.sigmaLevel,
      defect_rate: qualityData.defectRate,
      timestamp: new Date().toISOString()
    });
  }

  submitInventoryUpdate(inventoryData: any): Observable<BlockchainResponse> {
    return this.submitBlockchainTransaction({
      type: 'inventory_update',
      item_id: inventoryData.itemId,
      quantity: inventoryData.quantity,
      location: inventoryData.location || 'Default',
      timestamp: new Date().toISOString()
    });
  }

  // Network Health
  private checkNetworkHealth(): void {
    this.http.get(`${this.apiUrl}/blockchain/health`, this.httpOptions)
      .subscribe({
        next: (health) => {
          this.networkStatusSubject.next({
            status: 'connected',
            health: health,
            lastChecked: new Date()
          });
        },
        error: (error) => {
          this.networkStatusSubject.next({
            status: 'disconnected',
            error: error.message,
            lastChecked: new Date()
          });
        }
      });
  }

  // Utility Functions
  generateTransactionId(): string {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  formatBlockchainHash(hash: string): string {
    return hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : 'N/A';
  }
}
