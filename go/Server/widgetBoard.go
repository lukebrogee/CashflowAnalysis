/*
------------------------------------------------------------------
FILE NAME:     widgetboard.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for widget board operations
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Initial file created.
------------------------------------------------------------------
*/
package main

import (
	services "cashflowanalysis/Services/DBContext"
	accData "cashflowanalysis/UserBankAccountData"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Links users bank account to a specific widget on the client side
func SaveWidgetAccount(c *gin.Context) {
	var body struct {
		WidgetID      int    `json:"WidgetID"`
		WidgetType    string `json:"WidgetType"`
		InstitutionID []int  `json:"InstitutionID"`
		AccountID     []int  `json:"AccountID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save account to widget."})
		return
	}

	liAccs := []services.DB_WidgetLinkedAccounts{}
	for i := 0; i < len(body.InstitutionID); i++ {
		liAccs = append(liAccs, services.DB_WidgetLinkedAccounts{
			WidgetID:        body.WidgetID,
			LinkedAccountID: body.AccountID[i],
		})
	}

	err := accData.SaveWidgetData(body.WidgetID, body.WidgetType, liAccs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save account to widget."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account saved to widget successfully."})
}

func DeleteWidgetAccount(c *gin.Context) {
	var body struct {
		WidgetID int `json:"WidgetID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save account to widget."})
		return
	}

	err := accData.DeleteWidgetData(body.WidgetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete account from widget."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted from widget successfully."})
}

func RetrieveWidgets(c *gin.Context) {
	wb := accData.RetrieveWidgetData(c.Request)

	c.JSON(http.StatusOK, gin.H{
		"WidgetBoardData": wb,
	})

}

func AddRowToWidgetBoard(c *gin.Context) {

	var body struct {
		Board services.DB_WidgetBoard `json:"WidgetBoard"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&body); err != nil {
		http.Error(c.Writer, err.Error(), http.StatusBadRequest)
		return
	}

	if len(body.Board.WidgetBoardRows) < 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No data for rows received"})
		return
	}
	success := accData.CreateWidgetRow(&body.Board.WidgetBoardRows[0])
	if !success {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add row to widget."})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Added row to widget successfully.", "ReturnedRow": body.Board.WidgetBoardRows[0]})
}
func DeleteRowToWidgetBoard(c *gin.Context) {
	var body struct {
		RowID int `json:"RowID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save account to widget."})
		return
	}

	success := accData.DeleteWidgetRow(body.RowID)
	if !success {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete row from widget."})
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted row from widget successfully."})
}
