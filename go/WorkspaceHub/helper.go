/*
------------------------------------------------------------------
FILE NAME:     WorkspaceHub/helper.go
PROJECT:       CashflowAnalysis
Date Created:  May-31-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles helper functions for workspace hub operations
--------------------------------------------------------------------
$HISTORY:

May-31-2026   Initial file created.
------------------------------------------------------------------
*/

package workspacehub

import (
	"fmt"
	"sort"
	"strconv"

	services "cashflowanalysis/Services/DBContext"
)

// Parses transaction data to get top categories, merchants, and transactions for a given set of transactions
func parseTransactionData(transactions []services.DB_AccountTransactions) ([][]string, [][]string, [][]string) {
	categoryTotals := map[string]float64{}
	merchantTotals := map[string]float64{}
	topTransactions := make([][]string, 0, len(transactions))

	// Sort transactions by amount in descending order to get top transactions
	sort.Slice(transactions, func(i, j int) bool {
		return transactions[i].Amount > transactions[j].Amount
	})

	//Iterate through transactions
	for _, tran := range transactions {
		// If category is nil or empty, categorize as "Miscellaneous"
		category := "Miscellaneous"

		//Add to category list if not in map
		if tran.Category != nil && *tran.Category != "" {
			category = *tran.Category
		}
		// Add transaction amount to category total
		categoryTotals[category] += tran.Amount

		//If merchant name is not nil or empty, add transaction amount to merchant total
		if tran.MerchantName != nil && *tran.MerchantName != "" {
			merchantTotals[*tran.MerchantName] += tran.Amount
		}

		// Add transaction to top transactions list
		topTransactions = append(topTransactions, []string{tran.Name, fmt.Sprintf("%f", tran.Amount)})
	}

	type amountPair struct {
		key    string
		amount float64
	}

	// Sort categories and merchants by total amount in descending order to get top categories and merchants
	categoryPairs := make([]amountPair, 0, len(categoryTotals))
	for category, amount := range categoryTotals {
		categoryPairs = append(categoryPairs, amountPair{key: category, amount: amount})
	}
	sort.Slice(categoryPairs, func(i, j int) bool {
		return categoryPairs[i].amount > categoryPairs[j].amount
	})

	topCategories := make([][]string, 0, len(categoryPairs))
	for _, pair := range categoryPairs {
		topCategories = append(topCategories, []string{pair.key, fmt.Sprintf("%f", pair.amount)})
	}

	merchantPairs := make([]amountPair, 0, len(merchantTotals))
	for merchant, amount := range merchantTotals {
		merchantPairs = append(merchantPairs, amountPair{key: merchant, amount: amount})
	}
	sort.Slice(merchantPairs, func(i, j int) bool {
		return merchantPairs[i].amount > merchantPairs[j].amount
	})

	topMerchants := make([][]string, 0, len(merchantPairs))
	for _, pair := range merchantPairs {
		topMerchants = append(topMerchants, []string{pair.key, fmt.Sprintf("%f", pair.amount)})
	}

	return topCategories, topMerchants, topTransactions
}

// Get list of plaid account ids linked and their corresponding account names for a workspace hub
func retrieveLinkedAccounts(workspaceHubID int) ([]string, [][]string, error) {
	linkedAccounts := services.DB_WorkspaceHub_LinkedAccounts{
		WorkspaceHubID: workspaceHubID,
	}

	laIDs, err := services.LoadObjectDB(&linkedAccounts, "WorkspaceHubID")
	if err != nil {
		return nil, nil, err
	}

	var plaidAccIDs []string
	var accountData [][]string
	for _, laID := range laIDs {
		ad := services.DB_LinkedAccounts{
			AccountID: laID.AccountID,
		}
		aDatabase, err := services.LoadObjectDB(&ad, "AccountID")
		if err != nil {
			return nil, nil, err
		}
		if len(aDatabase) > 0 {
			plaidAccIDs = append(plaidAccIDs, aDatabase[0].PlaidAccountID)
			accountData = append(accountData, []string{strconv.Itoa(laID.LinkedAccountsID), aDatabase[0].Name})
		}
	}

	return plaidAccIDs, accountData, nil
}
