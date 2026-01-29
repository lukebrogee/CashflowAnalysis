/*
------------------------------------------------------------------
FILE NAME:     helper.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-04-2026
--------------------------------------------------------------------
DESCRIPTION:
Helper file for retrieving and storing users account data from the
plaid api
--------------------------------------------------------------------
$HISTORY:

Jan-04-2026   Created initial file.
Jan-04-2026   Added storeInstitutionData() and storeAccountData()
Jan-28-2026   Updated to use new DBContext functions and structs
------------------------------------------------------------------
*/
package userbankaccountdata

import (
	services "cashflowanalysis/Services/DBContext"
	"time"

	plaid "github.com/plaid/plaid-go/v31/plaid"
)

// Stores the users Institution data
func storeInstitutionData(userID int, accessToken string, itemId string, institution plaid.Institution) int {

	li := services.DB_LinkedInstitutions{
		LinkedInstitutionID: 0,
		UserID:              userID,
		AccessToken:         accessToken,
		ItemID:              itemId,
		InstitutionName:     institution.Name,
		InstitutionID:       institution.InstitutionId,
		CreatedAt:           time.Now().UTC(),
		UpdatedAt:           time.Now().UTC(),
	}

	db_lis, _ := services.LoadObjectDB(&li, "UserID", "InstitutionID")
	var db_li services.DB_LinkedInstitutions
	if len(db_lis) > 0 {
		db_li = db_lis[0]
	}
	if db_li.LinkedInstitutionID == 0 {
		li.LinkedInstitutionID, _ = services.CreateObjectDB(li)
	} else {
		li.LinkedInstitutionID = db_li.LinkedInstitutionID
		_ = services.UpdateObjectDB(li, []string{}, []string{"UserID", "InstitutionID"})
		//Once the database has embedded foreign keys to delete LinkedAccounts and AccountBalance
		//after LinkedInstitution is deleted this will not be necessary
		deletela := services.DB_LinkedAccounts{
			LinkedInstitutionID: db_li.LinkedInstitutionID,
		}
		services.DeleteObjectDB(deletela, "LinkedInstitutionID")

		deleteab := services.DB_AccountBalance{
			LinkedInstitutionID: db_li.LinkedInstitutionID,
		}
		services.DeleteObjectDB(deleteab, "LinkedInstitutionID")
		//-------//
	}

	return li.LinkedInstitutionID
}

// Stores the users account data associated with the Institution ID
func storeAccountData(linkedInstitutionID int, acc plaid.AccountBase) bool {

	la := services.DB_LinkedAccounts{
		AccountID:           0,
		LinkedInstitutionID: linkedInstitutionID,
		Name:                acc.Name,
		Type:                string(acc.Type),
		VerificationStatus:  acc.VerificationStatus,
		CreatedAt:           time.Now().UTC(),
		UpdatedAt:           time.Now().UTC(),
	}

	if acc.Mask.IsSet() {
		la.Mask = acc.Mask.Get()
	}
	if acc.OfficialName.IsSet() {
		la.OfficialName = acc.OfficialName.Get()
	}
	if acc.Subtype.IsSet() {
		s := string(*acc.Subtype.Get())
		la.Subtype = &s
	}
	if acc.HolderCategory.IsSet() {
		s := string(*acc.HolderCategory.Get())
		la.HolderCategory = &s
	}

	la.AccountID, _ = services.CreateObjectDB(la)

	ab := services.DB_AccountBalance{
		AccountBalanceID:    0,
		LinkedInstitutionID: linkedInstitutionID,
		AccountID:           la.AccountID,
		CreatedAt:           time.Now().UTC(),
		UpdatedAt:           time.Now().UTC(),
	}

	if acc.Balances.Available.IsSet() {
		v := acc.Balances.GetAvailable()
		ab.Available = &v
	}
	if acc.Balances.Current.IsSet() {
		v := acc.Balances.GetCurrent()
		ab.CurrentAmount = &v
	}
	if acc.Balances.Limit.IsSet() {
		v := acc.Balances.GetLimit()
		ab.LimitAmount = &v
	}
	if acc.Balances.IsoCurrencyCode.IsSet() {
		v := acc.Balances.GetIsoCurrencyCode()
		ab.ISOCurrencyCode = &v
	}
	if acc.Balances.UnofficialCurrencyCode.IsSet() {
		v := acc.Balances.GetUnofficialCurrencyCode()
		ab.UnofficialCurrencyCode = &v
	}
	if acc.Balances.LastUpdatedDatetime.IsSet() {
		v := acc.Balances.GetLastUpdatedDatetime()
		ab.AccountLastUpdatedAt = &v
	}

	ab.AccountID, _ = services.CreateObjectDB(ab)

	return true
}
