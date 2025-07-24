
'use strict';

const { Contract } = require('fabric-contract-api');

class SCMContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const initialData = [
            {
                id: 'ITEM001',
                name: 'Raw Materials',
                currentStock: 100,
                maxStock: 200,
                minStock: 20,
                location: 'Warehouse A',
                lastUpdated: new Date().toISOString()
            }
        ];

        for (const item of initialData) {
            await ctx.stub.putState(item.id, Buffer.from(JSON.stringify(item)));
            console.info(`Added inventory item: ${item.id}`);
        }
        
        console.info('============= END : Initialize Ledger ===========');
    }

    // Inventory Management Functions
    async createInventoryItem(ctx, itemId, name, currentStock, timestamp) {
        console.info('============= START : Create Inventory Item ===========');

        const exists = await this.inventoryItemExists(ctx, itemId);
        if (exists) {
            throw new Error(`Inventory item ${itemId} already exists`);
        }

        const inventoryItem = {
            id: itemId,
            name: name,
            currentStock: parseInt(currentStock),
            maxStock: 0,
            minStock: 0,
            reorderPoint: 0,
            location: '',
            createdAt: timestamp,
            lastUpdated: timestamp,
            transactionHistory: []
        };

        await ctx.stub.putState(itemId, Buffer.from(JSON.stringify(inventoryItem)));
        console.info('============= END : Create Inventory Item ===========');
        return JSON.stringify(inventoryItem);
    }

    async updateInventoryItem(ctx, itemId, newStock, reason, timestamp) {
        console.info('============= START : Update Inventory Item ===========');

        const inventoryItemAsBytes = await ctx.stub.getState(itemId);
        if (!inventoryItemAsBytes || inventoryItemAsBytes.length === 0) {
            throw new Error(`Inventory item ${itemId} does not exist`);
        }

        const inventoryItem = JSON.parse(inventoryItemAsBytes.toString());
        const oldStock = inventoryItem.currentStock;
        
        inventoryItem.currentStock = parseInt(newStock);
        inventoryItem.lastUpdated = timestamp;
        
        // Add to transaction history
        inventoryItem.transactionHistory.push({
            timestamp: timestamp,
            oldStock: oldStock,
            newStock: parseInt(newStock),
            change: parseInt(newStock) - oldStock,
            reason: reason,
            txId: ctx.stub.getTxID()
        });

        await ctx.stub.putState(itemId, Buffer.from(JSON.stringify(inventoryItem)));
        console.info('============= END : Update Inventory Item ===========');
        return JSON.stringify(inventoryItem);
    }

    async getInventoryItem(ctx, itemId) {
        const inventoryItemAsBytes = await ctx.stub.getState(itemId);
        if (!inventoryItemAsBytes || inventoryItemAsBytes.length === 0) {
            throw new Error(`Inventory item ${itemId} does not exist`);
        }
        return inventoryItemAsBytes.toString();
    }

    async inventoryItemExists(ctx, itemId) {
        const inventoryItemAsBytes = await ctx.stub.getState(itemId);
        return inventoryItemAsBytes && inventoryItemAsBytes.length > 0;
    }

    // Demand Forecasting Functions
    async recordDemandForecast(ctx, productId, forecastData, accuracy, timestamp) {
        console.info('============= START : Record Demand Forecast ===========');

        const forecastId = `FORECAST_${productId}_${Date.now()}`;
        const forecast = {
            id: forecastId,
            productId: productId,
            forecastData: JSON.parse(forecastData),
            accuracy: parseFloat(accuracy),
            timestamp: timestamp,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(forecastId, Buffer.from(JSON.stringify(forecast)));
        console.info('============= END : Record Demand Forecast ===========');
        return JSON.stringify(forecast);
    }

    // Quality Management Functions
    async recordQualityMetrics(ctx, batchId, sigmaLevel, defectRate, timestamp) {
        console.info('============= START : Record Quality Metrics ===========');

        const qualityId = `QUALITY_${batchId}_${Date.now()}`;
        const qualityRecord = {
            id: qualityId,
            batchId: batchId,
            sigmaLevel: parseFloat(sigmaLevel),
            defectRate: parseFloat(defectRate),
            timestamp: timestamp,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(qualityId, Buffer.from(JSON.stringify(qualityRecord)));
        console.info('============= END : Record Quality Metrics ===========');
        return JSON.stringify(qualityRecord);
    }

    // Supplier Management Functions
    async recordSupplierTransaction(ctx, supplierId, transactionData, timestamp) {
        console.info('============= START : Record Supplier Transaction ===========');

        const transactionId = `SUPPLIER_${supplierId}_${Date.now()}`;
        const supplierTransaction = {
            id: transactionId,
            supplierId: supplierId,
            transactionData: JSON.parse(transactionData),
            timestamp: timestamp,
            txId: ctx.stub.getTxID()
        };

        await ctx.stub.putState(transactionId, Buffer.from(JSON.stringify(supplierTransaction)));
        console.info('============= END : Record Supplier Transaction ===========');
        return JSON.stringify(supplierTransaction);
    }

    // Asset History Functions
    async getAssetHistory(ctx, assetId) {
        console.info('============= START : Get Asset History ===========');

        const resultsIterator = await ctx.stub.getHistoryForKey(assetId);
        const results = [];

        while (true) {
            const res = await resultsIterator.next();

            if (res.value) {
                const jsonRes = {};
                jsonRes.TxId = res.value.tx_id;
                jsonRes.Timestamp = new Date(res.value.timestamp.seconds.low * 1000).toISOString();
                jsonRes.IsDelete = res.value.is_delete.toString();

                if (res.value.value) {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                }

                results.push(jsonRes);
            }

            if (res.done) {
                await resultsIterator.close();
                console.info('============= END : Get Asset History ===========');
                return JSON.stringify(results);
            }
        }
    }

    // Query Functions
    async queryAllAssets(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                const jsonRes = {};
                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes);
            }

            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    // Rich Query Functions (CouchDB)
    async queryAssetsByType(ctx, assetType) {
        const query = {
            selector: {
                id: {
                    $regex: `^${assetType}_.*`
                }
            }
        };

        const queryString = JSON.stringify(query);
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = [];

        while (true) {
            const res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                const jsonRes = {};
                jsonRes.Key = res.value.key;
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                results.push(jsonRes);
            }

            if (res.done) {
                await resultsIterator.close();
                return JSON.stringify(results);
            }
        }
    }
}

module.exports = SCMContract;
