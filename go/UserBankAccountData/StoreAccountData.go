/*
------------------------------------------------------------------
FILE NAME:     StoreAccountData.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Stores user account and institution data into azure sql servers
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Jan-04-2026   Added StoreUserPlaidData()
Jan-06-2026   Added SaveWidgetData()
------------------------------------------------------------------
*/
package userbankaccountdata

import (
	helper "cashflowanalysis/Services/Helpers"
	"net/http"

	plaidServices "cashflowanalysis/PlaidComponents"
	services "cashflowanalysis/Services/DBContext"
)

// After retrieving the accesstoken, gather institution and account data.
// Then store all data into azure sql
func StoreUserPlaidData(r *http.Request, publicToken string) bool {
	userID := helper.GetUserID(r)
	accessToken, err := plaidServices.GetAccessToken(publicToken)
	if err != nil {
		return false
	}
	linkedAccounts, err := plaidServices.Accounts()
	if err != nil {
		return false
	}
	item, institution, err := plaidServices.Item()
	if err != nil {
		return false
	}

	institutionId := storeInstitutionData(userID, accessToken, item.ItemId, institution)

	for _, acc := range linkedAccounts {
		storeAccountData(institutionId, acc)
	}

	return true
}

// Links bank accounts to a specific widget on the users screen
func SaveWidgetData(r *http.Request, userWidgetID int, institutionID int, accountID int) int {
	uw := services.DB_UserWidgets{
		WidgetID:      0,
		UserWidgetID:  userWidgetID,
		InstitutionID: institutionID,
		AccountID:     accountID,
	}

	widgetID, err := services.CreateObjectDB(&uw)
	if err != nil {
		return 0
	}
	return widgetID
}
