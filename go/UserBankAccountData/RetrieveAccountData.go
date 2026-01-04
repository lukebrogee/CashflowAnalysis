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
