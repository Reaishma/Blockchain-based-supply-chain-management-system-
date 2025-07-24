
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type SupplyChainData struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"`
	Data          string    `json:"data"`
	Timestamp     time.Time `json:"timestamp"`
	Owner         string    `json:"owner"`
	PreviousHash  string    `json:"previousHash"`
	Hash          string    `json:"hash"`
}

type DemandForecast struct {
	ID               string    `json:"id"`
	HistoricalSales  []int     `json:"historicalSales"`
	ForecastAccuracy float64   `json:"forecastAccuracy"`
	NextMonthDemand  int       `json:"nextMonthDemand"`
	ConfidenceLevel  float64   `json:"confidenceLevel"`
	Timestamp        time.Time `json:"timestamp"`
}

type InventoryData struct {
	ID            string    `json:"id"`
	ItemName      string    `json:"itemName"`
	CurrentStock  int       `json:"currentStock"`
	MaxStock      int       `json:"maxStock"`
	MinStock      int       `json:"minStock"`
	ReorderPoint  int       `json:"reorderPoint"`
	LeadTime      int       `json:"leadTime"`
	StockLevel    int       `json:"stockLevel"`
	Status        string    `json:"status"`
	Timestamp     time.Time `json:"timestamp"`
}

type RiskAssessment struct {
	ID            string    `json:"id"`
	SupplyRisk    float64   `json:"supplyRisk"`
	DemandRisk    float64   `json:"demandRisk"`
	QualityRisk   float64   `json:"qualityRisk"`
	FinancialRisk float64   `json:"financialRisk"`
	OverallRisk   float64   `json:"overallRisk"`
	RiskCategory  string    `json:"riskCategory"`
	Timestamp     time.Time `json:"timestamp"`
}

func (s *SmartContract) StoreDemandForecast(ctx contractapi.TransactionContextInterface, id string, historicalSalesJSON string, forecastAccuracy float64, nextMonthDemand int, confidenceLevel float64) error {
	var historicalSales []int
	err := json.Unmarshal([]byte(historicalSalesJSON), &historicalSales)
	if err != nil {
		return fmt.Errorf("failed to parse historical sales: %v", err)
	}

	forecast := DemandForecast{
		ID:               id,
		HistoricalSales:  historicalSales,
		ForecastAccuracy: forecastAccuracy,
		NextMonthDemand:  nextMonthDemand,
		ConfidenceLevel:  confidenceLevel,
		Timestamp:        time.Now(),
	}

	forecastJSON, err := json.Marshal(forecast)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, forecastJSON)
}

func (s *SmartContract) StoreInventoryData(ctx contractapi.TransactionContextInterface, id string, itemName string, currentStock int, maxStock int, minStock int, reorderPoint int, leadTime int, stockLevel int, status string) error {
	inventory := InventoryData{
		ID:           id,
		ItemName:     itemName,
		CurrentStock: currentStock,
		MaxStock:     maxStock,
		MinStock:     minStock,
		ReorderPoint: reorderPoint,
		LeadTime:     leadTime,
		StockLevel:   stockLevel,
		Status:       status,
		Timestamp:    time.Now(),
	}

	inventoryJSON, err := json.Marshal(inventory)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, inventoryJSON)
}

func (s *SmartContract) StoreRiskAssessment(ctx contractapi.TransactionContextInterface, id string, supplyRisk float64, demandRisk float64, qualityRisk float64, financialRisk float64) error {
	overallRisk := (supplyRisk + demandRisk + qualityRisk + financialRisk) / 4
	
	var riskCategory string
	if overallRisk >= 7 {
		riskCategory = "High"
	} else if overallRisk >= 4 {
		riskCategory = "Medium"
	} else {
		riskCategory = "Low"
	}

	risk := RiskAssessment{
		ID:            id,
		SupplyRisk:    supplyRisk,
		DemandRisk:    demandRisk,
		QualityRisk:   qualityRisk,
		FinancialRisk: financialRisk,
		OverallRisk:   overallRisk,
		RiskCategory:  riskCategory,
		Timestamp:     time.Now(),
	}

	riskJSON, err := json.Marshal(risk)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, riskJSON)
}

func (s *SmartContract) QueryData(ctx contractapi.TransactionContextInterface, id string) (string, error) {
	dataJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return "", fmt.Errorf("failed to read from world state: %v", err)
	}
	if dataJSON == nil {
		return "", fmt.Errorf("the data %s does not exist", id)
	}

	return string(dataJSON), nil
}

func (s *SmartContract) GetAllData(ctx contractapi.TransactionContextInterface, startKey string, endKey string) ([]string, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var results []string
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		results = append(results, string(queryResponse.Value))
	}

	return results, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating supply chain chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting supply chain chaincode: %v", err)
	}
}
