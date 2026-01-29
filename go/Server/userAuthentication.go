/*
------------------------------------------------------------------
FILE NAME:     userAuthentication.go
PROJECT:       CashflowAnalysis
Date Created:  Jan-28-2026
--------------------------------------------------------------------
DESCRIPTION:
Handles api calls for user authentication and authorization
--------------------------------------------------------------------
$HISTORY:

Jan-28-2026   Initial file created.
------------------------------------------------------------------
*/
package main

import (
	userauth "cashflowanalysis/UserAuth"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
