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
------------------------------------------------------------------
*/
package main

import (
	plaidServices "cashflowanalysis/PlaidComponents"
	accData "cashflowanalysis/UserBankAccountData"
	"fmt"
	"net/http"

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

func GetAllTransactions(c *gin.Context) {

	cursor, transactions, _ := plaidServices.Transactions()
	fmt.Println("Cursor:", cursor)
	fmt.Println("Transactions:")
	for _, tx := range transactions {
		fmt.Printf(" - %s: %s\n", tx.GetDate(), tx.GetName())
	}
}
