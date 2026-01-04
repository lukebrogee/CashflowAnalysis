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
------------------------------------------------------------------
*/
package userbankaccountdata

import (
	helper "cashflowanalysis/Services/Helpers"
	"net/http"

	plaidServices "cashflowanalysis/PlaidComponents"
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
