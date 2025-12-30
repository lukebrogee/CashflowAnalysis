/*
------------------------------------------------------------------
FILE NAME:     cookieHandler.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
This file contains helper functions for working with cookies in a secure manner.
It includes functions for reading, writing, and encrypting cookies, as well as
handling signed cookies.

--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Deleted testSetCookie() and testGetCookie(). Cookies now get set with Expire time instead of Max Age
------------------------------------------------------------------
*/
package cookiehandler

import (
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Explanation on cookie encryption and signing
// This code demonstrates how to securely handle cookies in Go by using encryption and signing techniques.
// The main goals are to protect the confidentiality and integrity of cookie data, preventing tampering and unauthorized access.
//https://www.alexedwards.net/blog/working-with-cookies-in-go

var (
	ErrValueTooLong = errors.New("cookie value too long")
	ErrInvalidValue = errors.New("invalid cookie value")
	secretKey       []byte
)

// Creates cookie on the client side
func SetCookie(w http.ResponseWriter, cookieName string, cookieValue string, expiresAt time.Time) error {

	SetSecretKeyFromHex()

	cookie := http.Cookie{
		Name:     cookieName,
		Value:    cookieValue,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	}

	err := WriteEncrypted(w, cookie, secretKey)
	if err != nil {
		log.Println(err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return err
	}

	w.Write([]byte("cookie set!"))
	return nil
}

// Returns the value of the cookie when given the cookie name
func GetCookie(r *http.Request, cookieName string) (string, error) {
	SetSecretKeyFromHex()
	value, err := ReadEncrypted(r, cookieName, secretKey)
	if err != nil {
		switch {
		case errors.Is(err, http.ErrNoCookie):
			return "", fmt.Errorf("cookie not found: %w", err)
		case errors.Is(err, ErrInvalidValue):
			return "", fmt.Errorf("invalid cookie value: %w", err)
		default:
			return "", fmt.Errorf("server error: %w", err)
		}
	}

	return value, nil
}

// SetSecretKeyFromHex initializes the package secretKey from a hex-encoded string.
// Call this during program startup (or in tests) before using the helpers.
func SetSecretKeyFromHex() error {
	var err error
	secretKey, err = hex.DecodeString("13d6b4dff8f84a10851021ec8608f814570d562c92fe6b5ec4c9f595bcb3234b")
	if err != nil {
		return err
	}

	return nil
}
