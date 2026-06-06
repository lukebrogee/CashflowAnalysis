/*
------------------------------------------------------------------
FILE NAME:     workspaceHub.go
PROJECT:       CashflowAnalysis
Date Created:  May-30-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for workspace hub operations
--------------------------------------------------------------------
$HISTORY:

May-30-2026   Initial file created.
------------------------------------------------------------------
*/
package main

/*
- When name of ecosystem is changed the workspace name should be updated, will probably have to do component reload
- Add css to popups
- if an account is already linked to a workspace, disable the option to add it again and show which workspace it's linked to
- Fix add a workspace button css
*/

import (
	services "cashflowanalysis/Services/DBContext"
	wh "cashflowanalysis/workspacehub"
	"time"

	helper "cashflowanalysis/Services/Helpers"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Retrieves list of workspace hubs for a user
func RetrieveWorkspaceList(c *gin.Context) {
	userID := helper.GetUserID(c.Request)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found."})
		return
	}
	workspaces, err := wh.RetrieveWorkspaceList(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve workspace list."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"workspaceList": workspaces})
}

// Creates new workspace hub and returns the new workspace hub id
func SaveWorkspaceHub(c *gin.Context) {
	var body struct {
		Name string `json:"Name"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save workspace hub."})
		return
	}
	workspaceHub := services.DB_WorkspaceHub{
		UserID:    helper.GetUserID(c.Request),
		Name:      body.Name,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}

	//Create new workspace hub
	err, id := wh.AddWorkspaceHub(workspaceHub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save workspace hub."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Workspace hub created successfully.", "WorkspaceHubID": id})

}

// Updates workspace hub name
func RenameWorkspaceHub(c *gin.Context) {
	var body struct {
		WorkspaceHubID int    `json:"WorkspaceHubID"`
		Name           string `json:"Name"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not rename workspace hub."})
		return
	}

	workspaceHub := services.DB_WorkspaceHub{
		WorkspaceHubID: body.WorkspaceHubID,
		Name:           body.Name,
	}
	err := wh.RenameWorkspace(workspaceHub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not rename workspace hub."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Workspace hub renamed successfully."})
}

// Deletes workspace hub and all linked accounts associated with the workspace hub
func DeleteWorkspaceHub(c *gin.Context) {
	var body struct {
		WorkspaceHubID int `json:"WorkspaceHubID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete workspace hub."})
		return
	}

	err := wh.DeleteWorkspace(body.WorkspaceHubID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete workspace hub."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Workspace deleted successfully."})
}

// Add linked account to workspace hub
func AddAccountToWorkspaceHub(c *gin.Context) {
	var body struct {
		WorkspaceHubID  int `json:"WorkspaceHubID"`
		LinkedAccountID int `json:"LinkedAccountID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add account to workspace hub."})
		return
	}
	err := wh.AddAccount(body.WorkspaceHubID, body.LinkedAccountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add account to workspace hub."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account added to workspace hub successfully."})
}

// Remove linked account from workspace hub
func RemoveAccountsFromWorkspaceHub(c *gin.Context) {
	var body struct {
		WorkspaceHubID   int   `json:"WorkspaceHubID"`
		LinkedAccountIDs []int `json:"LinkedAccountIDs"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not remove account from workspace hub."})
		return
	}
	err := wh.RemoveAccounts(body.WorkspaceHubID, body.LinkedAccountIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not remove account from workspace hub."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account removed from workspace hub successfully."})
}

// Retrieves workspace hub data including top categories, merchants, transactions, and linked account data for a workspace hub
func RetrieveWorkspaceHub(c *gin.Context) {

	var body struct {
		WorkspaceHubID int `json:"WorkspaceHubID"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve workspace hubs."})
		return
	}

	topCategories, topMerchants, topTransactions, accountData, err := wh.RetrieveData(body.WorkspaceHubID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"topCategories": topCategories, "topMerchants": topMerchants, "topTransactions": topTransactions, "accountData": accountData})
}
