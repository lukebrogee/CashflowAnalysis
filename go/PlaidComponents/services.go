/*
------------------------------------------------------------------
FILE NAME:     services.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-02-2026
--------------------------------------------------------------------
DESCRIPTION:
Holds all plaid components to interact with the plaid api
--------------------------------------------------------------------
$HISTORY:

Jan-02-2026  Created initial file.
Jan-04-2026  Added all plaid components
------------------------------------------------------------------
*/

package PlaidComponents

import (
	"bufio"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/joho/godotenv"
	plaid "github.com/plaid/plaid-go/v31/plaid"
)

// We store the access_token and user_token in memory - in production, store it in a secure
// persistent data store.
var accessToken string
var userToken string
var itemID string

var paymentID string

// The authorizationID is only relevant for the Transfer ACH product.
// We store the authorizationID in memory - in production, store it in a secure
// persistent data store
var authorizationID string
var accountID string

var (
	PLAID_CLIENT_ID                      = ""
	PLAID_SECRET                         = ""
	PLAID_ENV                            = ""
	PLAID_PRODUCTS                       = ""
	PLAID_COUNTRY_CODES                  = ""
	PLAID_REDIRECT_URI                   = ""
	APP_PORT                             = ""
	client              *plaid.APIClient = nil
)

var environments = map[string]plaid.Environment{
	"sandbox":    plaid.Sandbox,
	"production": plaid.Production,
}

func init() {
	// load env vars from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error when loading environment variables from .env file %w", err)
	}

	// set constants from env
	PLAID_CLIENT_ID = os.Getenv("PLAID_CLIENT_ID")
	PLAID_SECRET = os.Getenv("PLAID_SECRET")

	if PLAID_CLIENT_ID == "" || PLAID_SECRET == "" {
		log.Fatal("Error: PLAID_SECRET or PLAID_CLIENT_ID is not set. Did you copy .env.example to .env and fill it out?")
	}

	PLAID_ENV = os.Getenv("PLAID_ENV")
	PLAID_PRODUCTS = os.Getenv("PLAID_PRODUCTS")
	PLAID_COUNTRY_CODES = os.Getenv("PLAID_COUNTRY_CODES")
	PLAID_REDIRECT_URI = os.Getenv("PLAID_REDIRECT_URI")

	// set defaults
	if PLAID_PRODUCTS == "" {
		PLAID_PRODUCTS = "transactions"
	}
	if PLAID_COUNTRY_CODES == "" {
		PLAID_COUNTRY_CODES = "US"
	}
	if PLAID_ENV == "" {
		PLAID_ENV = "sandbox"
	}

	if PLAID_CLIENT_ID == "" {
		log.Fatal("PLAID_CLIENT_ID is not set. Make sure to fill out the .env file")
	}
	if PLAID_SECRET == "" {
		log.Fatal("PLAID_SECRET is not set. Make sure to fill out the .env file")
	}

	// create Plaid client
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", PLAID_CLIENT_ID)
	configuration.AddDefaultHeader("PLAID-SECRET", PLAID_SECRET)
	configuration.UseEnvironment(environments[PLAID_ENV])
	client = plaid.NewAPIClient(configuration)
}

func Info() (string, string, []string) {
	return accessToken, itemID, strings.Split(PLAID_PRODUCTS, ",")
}

func CreateLinkToken() (string, error) {
	linkToken, err := linkTokenCreate(nil)
	if err != nil {
		return "", err
	}
	return linkToken, nil
}

func CreatePublicToken() (string, error) {
	ctx := context.Background()

	// Create a one-time use public_token for the Item.
	// This public_token can be used to initialize Link in update mode for a user
	publicTokenCreateResp, _, err := client.PlaidApi.ItemCreatePublicToken(ctx).ItemPublicTokenCreateRequest(
		*plaid.NewItemPublicTokenCreateRequest(accessToken),
	).Execute()

	if err != nil {
		return "", err
	}

	return publicTokenCreateResp.GetPublicToken(), nil
}

func CreateUserToken() (string, error) {
	userToken, err := userTokenCreate()
	if err != nil {
		return "", err
	}
	return userToken, nil
}

func GetAccessToken(publicToken string) (string, error) {
	ctx := context.Background()

	// exchange the public_token for an access_token
	exchangePublicTokenResp, _, err := client.PlaidApi.ItemPublicTokenExchange(ctx).ItemPublicTokenExchangeRequest(
		*plaid.NewItemPublicTokenExchangeRequest(publicToken),
	).Execute()
	if err != nil {
		return "", err
	}

	accessToken = exchangePublicTokenResp.GetAccessToken()
	itemID = exchangePublicTokenResp.GetItemId()

	fmt.Println("public token: " + publicToken)
	fmt.Println("access token: " + accessToken)
	fmt.Println("item ID: " + itemID)

	//c.JSON(http.StatusOK, gin.H{
	//	"access_token": accessToken,
	//	"item_id":      itemID,
	//})
	return accessToken, nil
}

func Accounts() ([]plaid.AccountBase, error) {
	ctx := context.Background()

	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		return nil, err
	}
	return accountsGetResp.GetAccounts(), nil
}

func Balance() ([]plaid.AccountBase, error) {
	ctx := context.Background()

	balancesGetResp, _, err := client.PlaidApi.AccountsBalanceGet(ctx).AccountsBalanceGetRequest(
		*plaid.NewAccountsBalanceGetRequest(accessToken),
	).Execute()

	if err != nil {
		return nil, err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"accounts": balancesGetResp.GetAccounts(),
	//})
	return balancesGetResp.GetAccounts(), nil
}

func Item() (plaid.ItemWithConsentFields, plaid.Institution, error) {
	ctx := context.Background()

	itemGetResp, _, err := client.PlaidApi.ItemGet(ctx).ItemGetRequest(
		*plaid.NewItemGetRequest(accessToken),
	).Execute()

	if err != nil {
		return plaid.ItemWithConsentFields{}, plaid.Institution{}, err
	}

	institutionGetByIdResp, _, err := client.PlaidApi.InstitutionsGetById(ctx).InstitutionsGetByIdRequest(
		*plaid.NewInstitutionsGetByIdRequest(
			*itemGetResp.GetItem().InstitutionId.Get(),
			convertCountryCodes(strings.Split(PLAID_COUNTRY_CODES, ",")),
		),
	).Execute()

	if err != nil {
		return plaid.ItemWithConsentFields{}, plaid.Institution{}, err
	}

	return itemGetResp.GetItem(), institutionGetByIdResp.GetInstitution(), nil
}

func Transactions() (string, []plaid.Transaction, error) {
	ctx := context.Background()

	// Set cursor to empty to receive all historical updates
	var cursor *string

	// New transaction updates since "cursor"
	var added []plaid.Transaction
	var modified []plaid.Transaction
	var removed []plaid.RemovedTransaction // Removed transaction ids
	hasMore := true
	// Iterate through each page of new transaction updates for item
	for hasMore {
		request := plaid.NewTransactionsSyncRequest(accessToken)
		if cursor != nil {
			request.SetCursor(*cursor)
		}
		resp, _, err := client.PlaidApi.TransactionsSync(
			ctx,
		).TransactionsSyncRequest(*request).Execute()
		if err != nil {
			return "", nil, err
		}

		// Update cursor to the next cursor
		nextCursor := resp.GetNextCursor()
		cursor = &nextCursor

		// If no transactions are available yet, wait and poll the endpoint.
		// Normally, we would listen for a webhook, but the Quickstart doesn't
		// support webhooks. For a webhook example, see
		// https://github.com/plaid/tutorial-resources or
		// https://github.com/plaid/pattern

		if *cursor == "" {
			time.Sleep(2 * time.Second)
			continue
		}

		// Add this page of results
		added = append(added, resp.GetAdded()...)
		modified = append(modified, resp.GetModified()...)
		removed = append(removed, resp.GetRemoved()...)
		hasMore = resp.GetHasMore()
	}

	sort.Slice(added, func(i, j int) bool {
		return added[i].GetDate() < added[j].GetDate()
	})
	_ = added[len(added)-9:]
	//latestTransactions := added[len(added)-9:]

	//c.JSON(http.StatusOK, gin.H{
	//	"latest_transactions": latestTransactions,
	//})
	return *cursor, added, nil
}

/*--------------PLAID FUNCTIONS NOT USED YET--------------------------*/
func auth() error {
	ctx := context.Background()

	authGetResp, _, err := client.PlaidApi.AuthGet(ctx).AuthGetRequest(
		*plaid.NewAuthGetRequest(accessToken),
	).Execute()

	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"accounts": authGetResp.GetAccounts(),
	//	"numbers":  authGetResp.GetNumbers(),
	//})
	fmt.Println(authGetResp.GetAccounts(), authGetResp.GetNumbers())
	return nil
}

func identity() error {
	ctx := context.Background()

	identityGetResp, _, err := client.PlaidApi.IdentityGet(ctx).IdentityGetRequest(
		*plaid.NewIdentityGetRequest(accessToken),
	).Execute()
	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"identity": identityGetResp.GetAccounts(),
	//})
	fmt.Println(identityGetResp.GetAccounts())
	return nil
}

// Currently dont return anything. Review commented c.JSON for what to expect return to be//
func investmentTransactions() error {
	ctx := context.Background()

	endDate := time.Now().Local().Format("2006-01-02")
	startDate := time.Now().Local().Add(-30 * 24 * time.Hour).Format("2006-01-02")

	request := plaid.NewInvestmentsTransactionsGetRequest(accessToken, startDate, endDate)
	invTxResp, _, err := client.PlaidApi.InvestmentsTransactionsGet(ctx).InvestmentsTransactionsGetRequest(*request).Execute()

	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"investments_transactions": invTxResp,
	//})
	fmt.Println(invTxResp)
	return nil
}

func holdings() error {
	ctx := context.Background()

	holdingsGetResp, _, err := client.PlaidApi.InvestmentsHoldingsGet(ctx).InvestmentsHoldingsGetRequest(
		*plaid.NewInvestmentsHoldingsGetRequest(accessToken),
	).Execute()
	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"holdings": holdingsGetResp,
	//})
	fmt.Println(holdingsGetResp)
	return nil
}

func assets() error {
	ctx := context.Background()

	createRequest := plaid.NewAssetReportCreateRequest(10)
	createRequest.SetAccessTokens([]string{accessToken})

	// create the asset report
	assetReportCreateResp, _, err := client.PlaidApi.AssetReportCreate(ctx).AssetReportCreateRequest(
		*createRequest,
	).Execute()
	if err != nil {
		return err
	}

	assetReportToken := assetReportCreateResp.GetAssetReportToken()

	// get the asset report
	assetReportGetResp, err := pollForAssetReport(ctx, client, assetReportToken)
	if err != nil {
		return err
	}

	// get it as a pdf
	pdfRequest := plaid.NewAssetReportPDFGetRequest(assetReportToken)
	pdfFile, _, err := client.PlaidApi.AssetReportPdfGet(ctx).AssetReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		return err
	}

	reader := bufio.NewReader(pdfFile)
	content, err := io.ReadAll(reader)
	if err != nil {
		return err
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	//c.JSON(http.StatusOK, gin.H{
	//	"json": assetReportGetResp.GetReport(),
	//	"pdf":  encodedPdf,
	//})
	fmt.Println(assetReportGetResp.GetReport())
	fmt.Println(encodedPdf)
	return nil
}

// This functionality is only relevant for the ACH Transfer product.
// Create Transfer for a specified Authorization ID

func transferAuthorize() error {
	ctx := context.Background()
	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		return err
	}

	accountID = accountsGetResp.GetAccounts()[0].AccountId
	transferType, err := plaid.NewTransferTypeFromValue("debit")
	transferNetwork, err := plaid.NewTransferNetworkFromValue("ach")
	ACHClass, err := plaid.NewACHClassFromValue("ppd")

	transferAuthorizationCreateUser := plaid.NewTransferAuthorizationUserInRequest("FirstName LastName")
	transferAuthorizationCreateRequest := plaid.NewTransferAuthorizationCreateRequest(
		accessToken,
		accountID,
		*transferType,
		*transferNetwork,
		"1.00",
		*transferAuthorizationCreateUser)

	transferAuthorizationCreateRequest.SetAchClass(*ACHClass)
	transferAuthorizationCreateResp, _, err := client.PlaidApi.TransferAuthorizationCreate(ctx).TransferAuthorizationCreateRequest(*transferAuthorizationCreateRequest).Execute()

	if err != nil {
		return err
	}

	authorizationID = transferAuthorizationCreateResp.GetAuthorization().Id

	//c.JSON(http.StatusOK, transferAuthorizationCreateResp)
	fmt.Println(transferAuthorizationCreateResp)
	return nil
}

func transferCreate() error {
	ctx := context.Background()

	transferCreateRequest := plaid.NewTransferCreateRequest(
		accessToken,
		accountID,
		authorizationID,
		"Debit",
	)

	transferCreateResp, _, err := client.PlaidApi.TransferCreate(ctx).TransferCreateRequest(*transferCreateRequest).Execute()

	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, transferCreateResp)
	fmt.Println(transferCreateResp)
	return nil
}

func signalEvaluate() error {
	ctx := context.Background()
	accountsGetResp, _, err := client.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*plaid.NewAccountsGetRequest(accessToken),
	).Execute()

	if err != nil {
		return err
	}

	accountID = accountsGetResp.GetAccounts()[0].AccountId

	signalEvaluateRequest := plaid.NewSignalEvaluateRequest(
		accessToken,
		accountID,
		"txn1234",
		100.00)

	signalEvaluateResp, _, err := client.PlaidApi.SignalEvaluate(ctx).SignalEvaluateRequest(*signalEvaluateRequest).Execute()

	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, signalEvaluateResp)
	fmt.Println(signalEvaluateResp)
	return nil
}

func statements() error {
	ctx := context.Background()
	statementsListResp, _, err := client.PlaidApi.StatementsList(ctx).StatementsListRequest(
		*plaid.NewStatementsListRequest(accessToken),
	).Execute()
	statementId := statementsListResp.GetAccounts()[0].GetStatements()[0].StatementId

	statementsDownloadResp, _, err := client.PlaidApi.StatementsDownload(ctx).StatementsDownloadRequest(
		*plaid.NewStatementsDownloadRequest(accessToken, statementId),
	).Execute()
	if err != nil {
		return err
	}

	reader := bufio.NewReader(statementsDownloadResp)
	content, err := io.ReadAll(reader)
	if err != nil {
		return err
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	//c.JSON(http.StatusOK, gin.H{
	//	"json": statementsListResp,
	//	"pdf":  encodedPdf,
	//})
	fmt.Println(statementsListResp)
	fmt.Println(encodedPdf)
	return nil
}

// Retrieve CRA Partner Insights
// https://plaid.com/docs/check/api/#cracheck_reportpartner_insightsget
func getCraPartnerInsightsHandler() error {
	ctx := context.Background()
	getResponse, err := getCraPartnerInsightsWithRetries(ctx, userToken)
	if err != nil {
		return nil
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"report": getResponse.Report,
	//})
	fmt.Println(getResponse.Report)
	return nil
}

// Retrieve CRA Income Insights and PDF with Insights
// Income insights: https://plaid.com/docs/check/api/#cracheck_reportincome_insightsget
// PDF w/ income insights: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraIncomeInsightsHandler() error {
	ctx := context.Background()
	getResponse, err := getCraIncomeInsightsWithRetries(ctx, userToken)
	if err != nil {
		return err
	}

	pdfRequest := plaid.NewCraCheckReportPDFGetRequest()
	pdfRequest.SetUserToken(userToken)
	pdfRequest.SetAddOns([]plaid.CraPDFAddOns{plaid.CRAPDFADDONS_CRA_INCOME_INSIGHTS})
	pdfResponse, _, err := client.PlaidApi.CraCheckReportPdfGet(ctx).CraCheckReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		return err
	}

	reader := bufio.NewReader(pdfResponse)
	content, err := io.ReadAll(reader)
	if err != nil {
		return err
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	//c.JSON(http.StatusOK, gin.H{
	//	"report": getResponse.Report,
	//	"pdf":    encodedPdf,
	//})
	fmt.Println(getResponse.Report)
	fmt.Println(encodedPdf)
	return nil
}

// Retrieve CRA Base Report and PDF
// Base report: https://plaid.com/docs/check/api/#cracheck_reportbase_reportget
// PDF: https://plaid.com/docs/check/api/#cracheck_reportpdfget
func getCraBaseReportHandler() error {
	ctx := context.Background()
	getResponse, err := getCraBaseReportWithRetries(ctx, userToken)
	if err != nil {
		return nil
	}

	pdfRequest := plaid.NewCraCheckReportPDFGetRequest()
	pdfRequest.SetUserToken(userToken)
	pdfResponse, _, err := client.PlaidApi.CraCheckReportPdfGet(ctx).CraCheckReportPDFGetRequest(*pdfRequest).Execute()
	if err != nil {
		return nil
	}

	reader := bufio.NewReader(pdfResponse)
	content, err := io.ReadAll(reader)
	if err != nil {
		return nil
	}

	// convert pdf to base64
	encodedPdf := base64.StdEncoding.EncodeToString(content)

	//c.JSON(http.StatusOK, gin.H{
	//	"report": getResponse.Report,
	//	"pdf":    encodedPdf,
	//})
	fmt.Println(getResponse.Report)
	fmt.Println(encodedPdf)
	return nil
}

/*----------------------MOST LIKELY WILL NEVER USE------------------*/
// This functionality is only relevant for the UK/EU Payment Initiation product.
// Creates a link token configured for payment initiation. The payment
// information will be associated with the link token, and will not have to be
// passed in again when we initialize Plaid Link.
// See:
// - https://plaid.com/docs/payment-initiation/
// - https://plaid.com/docs/#payment-initiation-create-link-token-request
func createLinkTokenForPayment() error {
	ctx := context.Background()

	// Create payment recipient
	paymentRecipientRequest := plaid.NewPaymentInitiationRecipientCreateRequest("Harry Potter")
	paymentRecipientRequest.SetIban("GB33BUKB20201555555555")
	paymentRecipientRequest.SetAddress(*plaid.NewPaymentInitiationAddress(
		[]string{"4 Privet Drive"},
		"Little Whinging",
		"11111",
		"GB",
	))
	paymentRecipientCreateResp, _, err := client.PlaidApi.PaymentInitiationRecipientCreate(ctx).PaymentInitiationRecipientCreateRequest(*paymentRecipientRequest).Execute()
	if err != nil {
		return err
	}

	// Create payment
	paymentCreateRequest := plaid.NewPaymentInitiationPaymentCreateRequest(
		paymentRecipientCreateResp.GetRecipientId(),
		"paymentRef",
		*plaid.NewPaymentAmount("GBP", 1.34),
	)
	paymentCreateResp, _, err := client.PlaidApi.PaymentInitiationPaymentCreate(ctx).PaymentInitiationPaymentCreateRequest(*paymentCreateRequest).Execute()
	if err != nil {
		return err
	}

	// We store the payment_id in memory for demo purposes - in production, store it in a secure
	// persistent data store along with the Payment metadata, such as userId.
	paymentID = paymentCreateResp.GetPaymentId()
	fmt.Println("payment id: " + paymentID)

	// Create the link_token
	linkTokenCreateReqPaymentInitiation := plaid.NewLinkTokenCreateRequestPaymentInitiation()
	linkTokenCreateReqPaymentInitiation.SetPaymentId(paymentID)
	linkToken, err := linkTokenCreate(linkTokenCreateReqPaymentInitiation)
	if err != nil {
		return err
	}
	//c.JSON(http.StatusOK, gin.H{
	//	"link_token": linkToken,
	//})
	fmt.Println(linkToken)
	return nil
}

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
func payment() error {
	ctx := context.Background()

	paymentGetResp, _, err := client.PlaidApi.PaymentInitiationPaymentGet(ctx).PaymentInitiationPaymentGetRequest(
		*plaid.NewPaymentInitiationPaymentGetRequest(paymentID),
	).Execute()

	if err != nil {
		return err
	}

	//c.JSON(http.StatusOK, gin.H{
	//	"payment": paymentGetResp,
	//})
	fmt.Println(paymentGetResp)
	return nil
}
