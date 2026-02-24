/*
------------------------------------------------------------------
FILE NAME:     financialAccountServices.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for users financial account services
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Initial file created.
Feb-24-2026   Added SyncTransactions() to retrieve all new transactions from plaid and add/update them to the database.
-             Changed GetAllTransactions() to RetrieveAllTransactions() and updated the method to retrieve all transactions from the database.

------------------------------------------------------------------
*/
package main

import (
	plaidServices "cashflowanalysis/PlaidComponents"
	services "cashflowanalysis/Services/DBContext"
	accData "cashflowanalysis/UserBankAccountData"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Given the public token, store the account data brought in from the users
// plaid choice
func StoreAccountData(c *gin.Context) {
	publicToken := c.PostForm("public_token")

	accData.StoreUserPlaidData(c.Request, publicToken)

	c.JSON(http.StatusOK, gin.H{"message": "Signup successful"})
}

// Retrieve all institution and account data tied to the users id and return
// in json call
func RetrieveAccountData(c *gin.Context) {
	institutions, accounts, accountBalances, err := accData.RetrieveAllUserAccountData(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	c.JSON(http.StatusOK, gin.H{
		"institutions":     institutions,
		"accounts":         accounts,
		"account_balances": accountBalances,
	})
}

// SyncTransactions will retrieve all transactions that have been added, modified, or removed since the last sync (cursor) and update the database accordingly.
// It will also update the cursor for each institution to the latest cursor returned by plaid.
func SyncTransactions(c *gin.Context) {
	institutions, _, _, err := accData.RetrieveAllUserAccountData(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	//Cycle through each institution assigned to the user and retrieve transactions
	for _, inst := range institutions {
		oldCursor := inst.CursorID
		added, modified, removed, err := plaidServices.Transactions(inst.AccessToken, &inst.CursorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		addedTransactions := make([]services.DB_AccountTransactions, len(added))
		modifiedTransactions := make([]services.DB_AccountTransactions, len(modified))
		removedTransactions := make([]services.DB_AccountTransactions, len(removed))

		//Add all new transactions
		for i, tran := range added {
			addedTransactions[i] = services.DB_AccountTransactions{
				TransactionID:   tran.TransactionId,
				AccountID:       tran.AccountId,
				Date:            tran.Date,
				MerchantName:    tran.MerchantName.Get(),
				Name:            tran.Name,
				Amount:          tran.Amount,
				IsoCurrencyCode: tran.IsoCurrencyCode.Get(),
				AuthorizedDate:  tran.AuthorizedDate.Get(),
				Pending:         tran.Pending,
				PaymentChannel:  tran.PaymentChannel,
				Category:        &tran.PersonalFinanceCategory.Get().Primary,
				LastSyncedAt:    time.Now().UTC(),
			}
		}

		_, err = services.CreateObjectDB_List(addedTransactions, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		//Update all modified transactions
		for i, tran := range modified {
			modifiedTransactions[i] = services.DB_AccountTransactions{
				TransactionID:   tran.TransactionId,
				AccountID:       tran.AccountId,
				Date:            tran.Date,
				MerchantName:    tran.MerchantName.Get(),
				Name:            tran.Name,
				Amount:          tran.Amount,
				IsoCurrencyCode: tran.IsoCurrencyCode.Get(),
				AuthorizedDate:  tran.AuthorizedDate.Get(),
				Pending:         tran.Pending,
				PaymentChannel:  tran.PaymentChannel,
				Category:        &tran.PersonalFinanceCategory.Get().Primary,
				LastSyncedAt:    time.Now().UTC(),
			}
		}
		_, err = services.UpdateObjectDB_List(modifiedTransactions, []string{}, []string{"TransactionID", "AccountID"}, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		//Update all removed transactions by setting IsRemoved to true
		for i, tran := range removed {
			removedTransactions[i] = services.DB_AccountTransactions{
				TransactionID: tran.TransactionId,
				AccountID:     tran.AccountId,
				IsRemoved:     true,
				LastSyncedAt:  time.Now().UTC(),
			}
		}

		_, err = services.UpdateObjectDB_List(removedTransactions, []string{"IsRemoved", "LastSyncedAt"}, []string{"TransactionID", "AccountID"}, 200)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		//Update the cursor for the institution to prevent duplicate transactions being added
		if oldCursor != inst.CursorID {
			inst.UpdatedAt = time.Now().UTC()
			err = services.UpdateObjectDB(inst, []string{"UpdatedAt", "CursorID"}, []string{"LinkedInstitutionID"})
			if err != nil {
				//Transactions will need to be deleted from the database if this fails
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transactions synced successfully"})
}

// Pulls all transactions from the database from the users accounts
func RetrieveAllTransactions(c *gin.Context) {
	_, accs, _, err := accData.RetrieveAllUserAccountData(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	//If the user has no accounts, return an empty list of transactions
	if len(accs) == 0 {
		c.JSON(http.StatusOK, gin.H{"transactions": []services.DB_AccountTransactions{}})
		return
	}
	accIDs := make([]string, len(accs))
	for i, acc := range accs {
		accIDs[i] = acc.PlaidAccountID
	}
	//Retrieve all transactions for the users accounts
	transactions, err := accData.RetrieveAllUserTransactions(accIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"Transactions": transactions,
		"Accounts":     accs,
	})
}
