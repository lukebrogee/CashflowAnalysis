/*
------------------------------------------------------------------
FILE NAME:     helper.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-04-2026
--------------------------------------------------------------------
DESCRIPTION:
Retrieves user account and institution data from azure sql servers
--------------------------------------------------------------------
$HISTORY:

Jan-04-2026   Created initial file.
Jan-04-2026   Added RetrieveAllUserAccountData()
Feb-24-2026   Added RetrieveAllUserTransactions()
------------------------------------------------------------------
*/
package userbankaccountdata

import (
	services "cashflowanalysis/Services/DBContext"
	helper "cashflowanalysis/Services/Helpers"
	"net/http"
)

// Retrieves the institution and account data tied to the users id
func RetrieveAllUserAccountData(r *http.Request) ([]services.DB_LinkedInstitutions,
	[]services.DB_LinkedAccounts, []services.DB_AccountBalance, error) {
	userID := helper.GetUserID(r)

	institution := services.DB_LinkedInstitutions{
		UserID: userID,
	}
	institutions, err := services.LoadObjectDB(&institution, "UserID")
	if err != nil {
		return nil, nil, nil, err
	}
	var accounts []services.DB_LinkedAccounts
	var accountBalances []services.DB_AccountBalance
	for _, ins := range institutions {
		acc := services.DB_LinkedAccounts{
			LinkedInstitutionID: ins.LinkedInstitutionID,
		}
		accs, err := services.LoadObjectDB(&acc, "LinkedInstitutionID")
		if err != nil {
			return nil, nil, nil, err
		}
		accounts = append(accounts, accs...)
		accBal := services.DB_AccountBalance{
			LinkedInstitutionID: ins.LinkedInstitutionID,
		}
		accBals, err := services.LoadObjectDB(&accBal, "LinkedInstitutionID")
		if err != nil {
			return nil, nil, nil, err
		}
		accountBalances = append(accountBalances, accBals...)
	}
	return institutions, accounts, accountBalances, nil
}

// Retrieves all transactions for the users accounts from the database
func RetrieveAllUserTransactions(plaidAccoundIDs []string) ([]services.DB_AccountTransactions, error) {
	var transactionsList []services.DB_AccountTransactions
	for _, accID := range plaidAccoundIDs {
		accTrans := services.DB_AccountTransactions{
			AccountID: accID,
		}
		transactions, err := services.LoadObjectDB(&accTrans, "AccountID")
		if err != nil {
			return transactions, err
		}
		//Append transactions for each account to the total list of transactions
		transactionsList = append(transactionsList, transactions...)
	}
	return transactionsList, nil
}
