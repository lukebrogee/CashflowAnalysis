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
Jan-06-2025   Added /api/SaveWidgetAccount/ with SaveWidgetAccount()
Jan-28-2026   Moved all api methods to seperate files under the same package main

------------------------------------------------------------------
*/
package main

import (
	"fmt"
	"net/http"
	"os"

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

	//Plaid Calls
	r.POST("/api/info", info)
	r.GET("/api/create_public_token", createPublicToken)
	r.POST("/api/create_link_token", createLinkToken)
	r.POST("/api/create_user_token", createUserToken)

	//User Account/Auth Calls
	r.POST("/api/login/", login)
	r.POST("/api/logout/", logout)
	r.POST("/api/signup/", signup)
	r.GET("/api/check_auth/", checkAuthorization)

	//User Bank Account Data Calls
	r.POST("/api/save_user_account/", StoreAccountData)
	r.GET("/api/retrieve_user_account/", RetrieveAccountData)
	r.GET("/api/all-transactions/", GetAllTransactions)

	//Widget Board Calls
	r.POST("/api/SaveWidgetAccount", SaveWidgetAccount)
	r.POST("/api/DeleteWidgetAccount", DeleteWidgetAccount)
	r.POST("/api/AddRowToWidgetBoard", AddRowToWidgetBoard)
	r.POST("/api/DeleteRowToWidgetBoard", DeleteRowToWidgetBoard)
	r.GET("/api/retrieveWidgets", RetrieveWidgets)

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
