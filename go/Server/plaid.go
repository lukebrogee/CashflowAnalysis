/*
------------------------------------------------------------------
FILE NAME:     plaid.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for plaid services
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Initial file created.
------------------------------------------------------------------
*/
package main

import (
	plaidServices "cashflowanalysis/PlaidComponents"
	"net/http"

	"github.com/gin-gonic/gin"
)

func info(c *gin.Context) {
	accessToken, itemID, products := plaidServices.Info()

	c.JSON(http.StatusOK, map[string]interface{}{
		"item_id":      itemID,
		"access_token": accessToken,
		"products":     products,
	})
}

func createPublicToken(c *gin.Context) {
	publicToken, err := plaidServices.CreatePublicToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"public_token": publicToken,
	})
}

func createLinkToken(c *gin.Context) {
	linkToken, err := plaidServices.CreateLinkToken()
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"link_token": linkToken})
}

func createUserToken(c *gin.Context) {
	userToken, err := plaidServices.CreateUserToken()
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_token": userToken})
}
