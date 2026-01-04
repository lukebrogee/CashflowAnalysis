/*
------------------------------------------------------------------
FILE NAME:     helper.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-02-2026
--------------------------------------------------------------------
DESCRIPTION:
Helper functions to assist in plaid services
--------------------------------------------------------------------
$HISTORY:

Jan-02-2026  Created initial file.
Jan-04-2026  Added all plaid helper functions
------------------------------------------------------------------
*/

package PlaidComponents

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/plaid/plaid-go/v31/plaid"
)

//func renderError(originalErr error) string {
//	if plaidError, err := plaid.ToPlaidError(originalErr); err == nil {
//		// Return 200 and allow the front end to render the error.
//		//c.JSON(http.StatusOK, gin.H{"error": plaidError})
//		return plaidError
//	}
//
//	//c.JSON(http.StatusInternalServerError, gin.H{"error": originalErr.Error()})
//	return originalErr.Error()
//}

// linkTokenCreate creates a link token using the specified parameters
func linkTokenCreate(
	paymentInitiation *plaid.LinkTokenCreateRequestPaymentInitiation,
) (string, error) {
	ctx := context.Background()

	// Institutions from all listed countries will be shown.
	countryCodes := convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ","))
	redirectURI := PLAID_REDIRECT_URI

	// This should correspond to a unique id for the current user.
	// Typically, this will be a user ID number from your application.
	// Personally identifiable information, such as an email address or phone number, should not be used here.
	user := plaid.LinkTokenCreateRequestUser{
		ClientUserId: time.Now().String(),
	}

	request := plaid.NewLinkTokenCreateRequest(
		"Plaid Quickstart",
		"en",
		countryCodes,
		user,
	)

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if paymentInitiation != nil {
		request.SetPaymentInitiation(*paymentInitiation)
		// The 'payment_initiation' product has to be the only element in the 'products' list.
		request.SetProducts([]plaid.Products{plaid.PRODUCTS_PAYMENT_INITIATION})
	} else {
		request.SetProducts(products)
	}

	if containsProduct(products, plaid.PRODUCTS_STATEMENTS) {
		statementConfig := plaid.NewLinkTokenCreateRequestStatements(
			time.Now().Local().Add(-30*24*time.Hour).Format("2006-01-02"),
			time.Now().Local().Format("2006-01-02"),
		)
		request.SetStatements(*statementConfig)
	}

	if containsProduct(products, plaid.PRODUCTS_CRA_BASE_REPORT) ||
		containsProduct(products, plaid.PRODUCTS_CRA_INCOME_INSIGHTS) ||
		containsProduct(products, plaid.PRODUCTS_CRA_PARTNER_INSIGHTS) {
		request.SetUserToken(userToken)
		request.SetConsumerReportPermissiblePurpose(plaid.CONSUMERREPORTPERMISSIBLEPURPOSE_ACCOUNT_REVIEW_CREDIT)
		request.SetCraOptions(*plaid.NewLinkTokenCreateRequestCraOptions(60))
	}

	if redirectURI != "" {
		request.SetRedirectUri(redirectURI)
	}

	linkTokenCreateResp, _, err := client.PlaidApi.LinkTokenCreate(ctx).LinkTokenCreateRequest(*request).Execute()

	if err != nil {
		return "", err
	}

	return linkTokenCreateResp.GetLinkToken(), nil
}

// Create a user token which can be used for Plaid Check, Income, or Multi-Item link flows
// https://plaid.com/docs/api/users/#usercreate
func userTokenCreate() (string, error) {
	ctx := context.Background()

	request := plaid.NewUserCreateRequest(
		// Typically this will be a user ID number from your application.
		time.Now().String(),
	)

	products := convertProducts(strings.Split(PLAID_PRODUCTS, ","))
	if containsProduct(products, plaid.PRODUCTS_CRA_BASE_REPORT) ||
		containsProduct(products, plaid.PRODUCTS_CRA_INCOME_INSIGHTS) ||
		containsProduct(products, plaid.PRODUCTS_CRA_PARTNER_INSIGHTS) {
		city := "New York"
		region := "NY"
		street := "4 Privet Drive"
		postalCode := "11111"
		country := "US"
		addressData := plaid.AddressData{
			City:       *plaid.NewNullableString(&city),
			Region:     *plaid.NewNullableString(&region),
			Street:     street,
			PostalCode: *plaid.NewNullableString(&postalCode),
			Country:    *plaid.NewNullableString(&country),
		}

		request.SetConsumerReportUserIdentity(*plaid.NewConsumerReportUserIdentity(
			"Harry",
			"Potter",
			[]string{"+16174567890"},
			[]string{"harrypotter@example.com"},
			addressData,
		))
	}

	userCreateResp, _, err := client.PlaidApi.UserCreate(ctx).UserCreateRequest(*request).Execute()

	if err != nil {
		return "", err
	}

	userToken = userCreateResp.GetUserToken()

	return userCreateResp.GetUserToken(), nil
}

func convertCountryCodes(countryCodeStrs []string) []plaid.CountryCode {
	countryCodes := []plaid.CountryCode{}

	for _, countryCodeStr := range countryCodeStrs {
		countryCodes = append(countryCodes, plaid.CountryCode(countryCodeStr))
	}

	return countryCodes
}

func convertProducts(productStrs []string) []plaid.Products {
	products := []plaid.Products{}

	for _, productStr := range productStrs {
		products = append(products, plaid.Products(productStr))
	}

	return products
}

func containsProduct(products []plaid.Products, product plaid.Products) bool {
	for _, p := range products {
		if p == product {
			return true
		}
	}
	return false
}

func pollForAssetReport(ctx context.Context, client *plaid.APIClient, assetReportToken string) (*plaid.AssetReportGetResponse, error) {
	return pollWithRetries(func() (*plaid.AssetReportGetResponse, error) {
		request := plaid.NewAssetReportGetRequest()
		request.SetAssetReportToken(assetReportToken)
		response, _, err := client.PlaidApi.AssetReportGet(ctx).AssetReportGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

// Since this quickstart does not support webhooks, this function can be used to poll
// an API that would otherwise be triggered by a webhook.
// For a webhook example, see
// https://github.com/plaid/tutorial-resources or
// https://github.com/plaid/pattern
func pollWithRetries[T any](requestCallback func() (T, error), ms int, retriesLeft int) (T, error) {
	var zero T
	if retriesLeft == 0 {
		return zero, fmt.Errorf("ran out of retries while polling")
	}
	response, err := requestCallback()
	if err != nil {
		plaidErr, err := plaid.ToPlaidError(err)
		if plaidErr.ErrorCode != "PRODUCT_NOT_READY" {
			return zero, err
		}
		time.Sleep(time.Duration(ms) * time.Millisecond)
		return pollWithRetries[T](requestCallback, ms, retriesLeft-1)
	}
	return response, nil
}

func getCraPartnerInsightsWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportPartnerInsightsGetResponse, error) {
		request := plaid.NewCraCheckReportPartnerInsightsGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportPartnerInsightsGet(ctx).CraCheckReportPartnerInsightsGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

func getCraIncomeInsightsWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportIncomeInsightsGetResponse, error) {
		request := plaid.NewCraCheckReportIncomeInsightsGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportIncomeInsightsGet(ctx).CraCheckReportIncomeInsightsGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}

func getCraBaseReportWithRetries(ctx context.Context, userToken string) (*plaid.CraCheckReportBaseReportGetResponse, error) {
	return pollWithRetries(func() (*plaid.CraCheckReportBaseReportGetResponse, error) {
		request := plaid.NewCraCheckReportBaseReportGetRequest()
		request.SetUserToken(userToken)
		response, _, err := client.PlaidApi.CraCheckReportBaseReportGet(ctx).CraCheckReportBaseReportGetRequest(*request).Execute()
		return &response, err
	}, 1000, 20)
}
