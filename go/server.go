/*
------------------------------------------------------------------
FILE NAME:     server.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Controls the main server operations, handling API requests and responses.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-25-2025   Updated login() and signup(). Added logout() and checkAuthorization()
-		      Added api calls /api/check-auth and /api/logout updated /api/login:username
-	          to /api/login and /api/signup/:username to /api/signup
Jan-04-2025   Moved all plaid handlers and components, added /api/retrieve_user_account/

------------------------------------------------------------------
*/
package main

import (
	"fmt"
	"net/http"
	"os"

	plaidServices "cashflowanalysis/PlaidComponents"
	userauth "cashflowanalysis/UserAuth"
	accData "cashflowanalysis/UserBankAccountData"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	plaid "github.com/plaid/plaid-go/v31/plaid"
)

var APP_PORT = ""

func init() {
	// load env vars from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error when loading environment variables from .env file %w", err)
	}
	APP_PORT = os.Getenv("APP_PORT")
	if APP_PORT == "" {
		APP_PORT = "8000"
	}
}

func main() {
	r := gin.Default()

	// For OAuth flows, the process looks as follows.
	// 1. Create a link token with the redirectURI (as white listed at https://dashboard.plaid.com/team/api).
	// 2. Once the flow succeeds, Plaid Link will redirect to redirectURI with
	// additional parameters (as required by OAuth standards and Plaid).
	// 3. Re-initialize with the link token (from step 1) and the full received redirect URI
	// from step 2.
	//r.POST("/api/set_access_token", getAccessToken)
	//r.POST("/api/create_link_token_for_payment", createLinkTokenForPayment)
	//r.GET("/api/auth", auth)
	//r.GET("/api/accounts", accounts)
	//r.GET("/api/balance", balance)
	//r.GET("/api/item", item)
	//r.POST("/api/item", item)
	//r.GET("/api/identity", identity)
	//r.GET("/api/transactions", transactions)
	//r.POST("/api/transactions", transactions)
	//r.GET("/api/payment", payment)
	//r.GET("/api/investments_transactions", investmentTransactions)
	//r.GET("/api/holdings", holdings)
	//r.GET("/api/assets", assets)
	//r.GET("/api/transfer_authorize", transferAuthorize)
	//r.GET("/api/transfer_create", transferCreate)
	//r.GET("/api/signal_evaluate", signalEvaluate)
	//r.GET("/api/statements", statements)
	//r.GET("/api/cra/get_base_report", getCraBaseReportHandler)
	//r.GET("/api/cra/get_income_insights", getCraIncomeInsightsHandler)
	//r.GET("/api/cra/get_partner_insights", getCraPartnerInsightsHandler)

	//Plaid API Calls
	r.POST("/api/info", info)
	r.GET("/api/create_public_token", createPublicToken)
	r.POST("/api/create_link_token", createLinkToken)
	r.POST("/api/create_user_token", createUserToken)

	//Server Created API Calls
	r.POST("/api/login/", login)
	r.POST("/api/logout/", logout)
	r.POST("/api/signup/", signup)
	r.GET("/api/check_auth/", checkAuthorization)
	r.POST("/api/save_user_account/", StoreAccountData)
	r.GET("/api/retrieve_user_account/", RetrieveAccountData)
	r.GET("/api/all-transactions/", GetAllTransactions)

	err := r.Run(":" + APP_PORT)
	if err != nil {
		panic("unable to start server")
	}
}

func renderError(c *gin.Context, originalErr error) {
	if plaidError, err := plaid.ToPlaidError(originalErr); err == nil {
		// Return 200 and allow the front end to render the error.
		c.JSON(http.StatusOK, gin.H{"error": plaidError})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": originalErr.Error()})
}

// Creates a new user and store their credentials in the database
// Authorizes user on sign up
func signup(c *gin.Context) {
	var recBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&recBody); err != nil {
		renderError(c, err)
		return
	}
	userauth.CreateNewUser(recBody.Username, recBody.Password)

	if userauth.AuthorizeUser(c.Writer, recBody.Username, recBody.Password) {
		c.JSON(http.StatusOK, gin.H{"message": "Signup successful"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Signup failed"})
	}
}

// Logs in user with the credentials given
// Authorizes user on login
func login(c *gin.Context) {
	var recBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&recBody); err != nil {
		renderError(c, err)
		return
	}
	if userauth.AuthorizeUser(c.Writer, recBody.Username, recBody.Password) {
		c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Login failed"})
	}
}

// Logs out user and unauthorizes them
func logout(c *gin.Context) {
	if userauth.UnauthorizeUser(c.Request, c.Writer) {
		c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
	}

	//still "logout" user on the frontend
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
	/*
	   401 Unauthorized	User is trying to log out
	   403 Forbidden	Logout should always be allowed
	   404 Not Found	Logout endpoint always exists
	   500 Internal Server Error	Only if DB/system actually failed
	*/
}

// Review the cookie from the client side to check if its still active
func checkAuthorization(c *gin.Context) {
	authorized, err := userauth.CheckUserAuthorization(c.Request, c.Writer)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"authorized": false})
		return
	} else {
		if authorized {
			c.JSON(http.StatusOK, gin.H{"authorized": true})
		} else {
			c.JSON(http.StatusOK, gin.H{"authorized": true})
		}
	}
}

// Given the public token, store the account data brought in from the users
// plaid choice
func StoreAccountData(c *gin.Context) {
	publicToken := c.PostForm("public_token")

	accData.StoreUserPlaidData(c.Request, publicToken)

	c.JSON(http.StatusOK, gin.H{"message": "Signup successful"})
}

// Retrieve all institution and account data tied to the users id and return
// in json call
func RetrieveAccountData(c *gin.Context) {
	institutions, accounts, accountBalances, err := accData.RetrieveAllUserAccountData(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	c.JSON(http.StatusOK, gin.H{
		"institutions":     institutions,
		"accounts":         accounts,
		"account_balances": accountBalances,
	})
}

func GetAllTransactions(c *gin.Context) {

	cursor, transactions, _ := plaidServices.Transactions()
	fmt.Println("Cursor:", cursor)
	fmt.Println("Transactions:")
	for _, tx := range transactions {
		fmt.Printf(" - %s: %s\n", tx.GetDate(), tx.GetName())
	}
}

func info(c *gin.Context) {
	accessToken, itemID, products := plaidServices.Info()

	c.JSON(http.StatusOK, map[string]interface{}{
		"item_id":      itemID,
		"access_token": accessToken,
		"products":     products,
	})
}

func createPublicToken(c *gin.Context) {
	publicToken, err := plaidServices.CreatePublicToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"public_token": publicToken,
	})
}

func createLinkToken(c *gin.Context) {
	linkToken, err := plaidServices.CreateLinkToken()
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"link_token": linkToken})
}

func createUserToken(c *gin.Context) {
	userToken, err := plaidServices.CreateUserToken()
	if err != nil {
		renderError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_token": userToken})
}
