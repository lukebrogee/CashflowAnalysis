/*
------------------------------------------------------------------
FILE NAME:     workspaceHubHandler.go
PROJECT:       CashflowAnalysis
Date Created:  May-31-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for workspace hub operations
--------------------------------------------------------------------
$HISTORY:

May-31-2026   Initial file created.
------------------------------------------------------------------
*/
package workspacehub

import (
	services "cashflowanalysis/Services/DBContext"
	accData "cashflowanalysis/UserBankAccountData"
	"time"
)

// Creates new workspace hub and returns the new workspace hub id
func AddWorkspaceHub(workspaceHub services.DB_WorkspaceHub) (error, int) {

	id, err := services.CreateObjectDB(workspaceHub)
	if err != nil {
		return err, 0
	}
	return nil, id
}

// Updates workspace hub name
func RenameWorkspace(workspaceHub services.DB_WorkspaceHub) error {

	err := services.UpdateObjectDB(workspaceHub, []string{"Name"}, []string{"WorkspaceHubID"})
	if err != nil {
		return err
	}
	return nil
}

// Deletes workspace hub and all linked accounts associated with the workspace hub
func DeleteWorkspace(workspaceHubID int) error {
	workspaceHub := services.DB_WorkspaceHub{
		WorkspaceHubID: workspaceHubID,
	}
	err := services.DeleteObjectDB(&workspaceHub, "WorkspaceHubID")
	if err != nil {
		return err
	}
	return nil
}

// Add linked account to workspace hub
func AddAccount(workspaceHubID int, linkedAccountID int) error {
	workspaceHubLinkedAccount := services.DB_WorkspaceHub_LinkedAccounts{
		WorkspaceHubID: workspaceHubID,
		AccountID:      linkedAccountID,
		AddedAt:        time.Now().UTC(),
	}

	_, err := services.CreateObjectDB(workspaceHubLinkedAccount)
	if err != nil {
		return err
	}
	return nil
}

// Remove linked account from workspace hub
func RemoveAccounts(workspaceHubID int, linkedAccountIDs []int) error {
	for _, linkedAccountID := range linkedAccountIDs {
		workspaceHubLinkedAccount := services.DB_WorkspaceHub_LinkedAccounts{
			WorkspaceHubID:   workspaceHubID,
			LinkedAccountsID: linkedAccountID,
		}
		err := services.DeleteObjectDB(&workspaceHubLinkedAccount, "WorkspaceHubID", "LinkedAccountsID")
		if err != nil {
			return err
		}
	}
	return nil
}

// Retrieves all data for a workspace hub including top categories, merchants, transactions, and linked accounts
func RetrieveData(workspaceHubID int) ([][]string, [][]string, [][]string, [][]string, error) {

	//Retrieve all accounts linked to the workspace hub
	linkedAccounts, accountData, err := retrieveLinkedAccounts(workspaceHubID)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	//Retrieve all transactions for the users accounts
	transactions, err := accData.RetrieveAllUserTransactions(linkedAccounts)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	topCategories, topMerchants, topTransactions := parseTransactionData(transactions)

	return topCategories, topMerchants, topTransactions, accountData, nil
}

// Gets list of all workspace hubs for a user
func RetrieveWorkspaceList(userID int) ([]services.DB_WorkspaceHub, error) {
	workspaceHub := services.DB_WorkspaceHub{
		UserID: userID,
	}
	workspaceList, err := services.LoadObjectDB(&workspaceHub, "UserID")
	if err != nil {
		return nil, err
	}
	return workspaceList, nil
}
