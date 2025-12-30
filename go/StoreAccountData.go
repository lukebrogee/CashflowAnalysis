/*
------------------------------------------------------------------
FILE NAME:     StoreAccountData.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Stores and retrieves user account and institution data in a JSON file.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
------------------------------------------------------------------
*/
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	plaid "github.com/plaid/plaid-go/v31/plaid"
)

const JSON_FILE_PATH = "./data.json"

type data struct {
	LinkedInstitutions []LinkedInstitution `json:"linked_institutions"`
}

type LinkedInstitution struct {
	AccessToken     string    `json:"access_token"`
	ItemID          string    `json:"item_id"`
	InstitutionName string    `json:"institution_name"`
	InstitutionID   string    `json:"institution_id"`
	Accounts        []Account `json:"accounts"`
	CreatedAt       string    `json:"created_at"`
	UpdatedAt       string    `json:"updated_at"`
}

type Account struct {
	AccountID      string                       `json:"account_id"`
	AccountBalance AccountBalance               `json:"account_balance"`
	Mask           plaid.NullableString         `json:"mask"`
	Name           string                       `json:"name"`
	OfficialName   plaid.NullableString         `json:"official_name"`
	Subtype        plaid.NullableAccountSubtype `json:"subtype"`
	AccountType    string                       `json:"type"`
}

type AccountBalance struct {
	Available              plaid.NullableFloat64 `json:"available"`
	Current                plaid.NullableFloat64 `json:"current"`
	Limit                  plaid.NullableFloat64 `json:"limit"`
	ISOCurrencyCode        plaid.NullableString  `json:"iso_currency_code"`
	UnofficialCurrencyCode plaid.NullableString  `json:"unofficial_currency_code"`
}

// CreateJsonAccountData loads data.json as a map of username -> data, appends
// a new LinkedInstitution to the specified user's LinkedInstitutions, and
// writes the file back.
func CreateJsonAccountData(username string) error {
	var institutionName string
	var institutionID string
	var accounts []plaid.AccountBase
	if err := CallPlaid_InstitutionData(&institutionName, &institutionID, &accounts); err != nil {
		return err
	}

	filePath := JSON_FILE_PATH

	// load existing store (map username -> data)
	store := make(map[string]data)
	if _, err := os.Stat(filePath); err == nil {
		b, err := os.ReadFile(filePath)
		if err == nil && len(b) > 0 {
			_ = json.Unmarshal(b, &store)
		}
	}

	// prepare new linked institution
	li := LinkedInstitution{
		AccessToken:     accessToken,
		ItemID:          itemID,
		InstitutionName: institutionName,
		InstitutionID:   institutionID,
		Accounts:        []Account{},
		CreatedAt:       time.Now().Format(time.RFC3339),
		UpdatedAt:       time.Now().Format(time.RFC3339),
	}

	for _, acct := range accounts {
		newAccount := Account{
			AccountID: acct.AccountId,
			AccountBalance: AccountBalance{
				Available:              acct.Balances.Available,
				Current:                acct.Balances.Current,
				Limit:                  acct.Balances.Limit,
				ISOCurrencyCode:        acct.Balances.IsoCurrencyCode,
				UnofficialCurrencyCode: acct.Balances.UnofficialCurrencyCode,
			},
			Mask:         acct.Mask,
			Name:         acct.Name,
			OfficialName: acct.OfficialName,
			Subtype:      acct.Subtype,
			AccountType:  string(acct.Type),
		}
		li.Accounts = append(li.Accounts, newAccount)
	}

	// get user's existing data (or empty)
	userData := store[username]
	userData.LinkedInstitutions = append(userData.LinkedInstitutions, li)
	store[username] = userData

	out, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filePath, out, 0644); err != nil {
		return err
	}

	return nil
}

// Use the Plaid API to get institution name, ID, and accounts for the current accessToken
func CallPlaid_InstitutionData(institutionName *string, institutionID *string, accounts *[]plaid.AccountBase) error {
	ctx := context.Background()

	itemGetResp, _, err := client.PlaidApi.ItemGet(ctx).ItemGetRequest(
		*plaid.NewItemGetRequest(accessToken),
	).Execute()

	if err != nil {
		return err
	}

	institutionGetByIdResp, _, err := client.PlaidApi.InstitutionsGetById(ctx).InstitutionsGetByIdRequest(
		*plaid.NewInstitutionsGetByIdRequest(
			*itemGetResp.GetItem().InstitutionId.Get(),
			convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ",")),
		),
	).Execute()

	if err != nil {
		return err
	}

	*institutionName = institutionGetByIdResp.GetInstitution().Name
	*institutionID = institutionGetByIdResp.GetInstitution().InstitutionId

	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		return err
	}

	*accounts = accountsGetResp.GetAccounts()

	return nil
}

// Use the users cookies to get username and pull data out of the data.json file to return institution data
func RetrieveInstitutionData(username string) (LinkedInstitution, error) {
	filePath := JSON_FILE_PATH

	//username := cookie.TGetCookie("username")

	// load existing store (map username -> data)
	store := make(map[string]data)
	if _, err := os.Stat(filePath); err == nil {
		b, err := os.ReadFile(filePath)
		if err == nil && len(b) > 0 {
			_ = json.Unmarshal(b, &store)
		}
	}

	// get user's existing data
	userData := store[username]
	if userData.LinkedInstitutions == nil {
		return LinkedInstitution{}, fmt.Errorf("no linked institutions found for user: %s", username)
	}

	// return the most recent linked institution
	return userData.LinkedInstitutions[len(userData.LinkedInstitutions)-1], nil
}
