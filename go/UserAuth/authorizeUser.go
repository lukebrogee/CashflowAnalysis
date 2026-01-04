/*
------------------------------------------------------------------
FILE NAME:     authorizeUser.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Checks user credentials against the database and provides password hashing functions.
Also serves to unauthorize a user by invalidating their session.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Jan-06-2025   Minor updating for the updated DBContext handlers
------------------------------------------------------------------
*/
package userauth

import (
	cookies "cashflowanalysis/CookieHandler"
	services "cashflowanalysis/Services/DBContext"
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const SessionDuration = 2 * time.Hour

var DeleteCookieExpiry = time.Unix(0, 0).UTC()

func sessionExpiry() time.Time {
	return time.Now().UTC().Add(SessionDuration)
}

// Authorizes user to access protected pages, creates cookie on the client side
// sets user to active and creates session in the database
// Prevents users from accessing public pages (i.e. default, login, sign up)
func AuthorizeUser(w http.ResponseWriter, username string, password string) bool {

	user := services.DB_Users{
		Username: username,
	}
	users, err := services.LoadObjectDB[services.DB_Users](&user, "Username")
	if err != nil {
		return false
	}
	if len(users) > 0 {
		user = users[0]
	}
	if !checkPasswordHash(password, user.PasswordHash) {
		return false
	}

	sessionId, expiry := activateSession(user)

	_ = cookies.SetCookie(w, "session-id", strconv.Itoa(sessionId), expiry)
	return true
}

// Unauthorizes user to access protected pages, deletes cookie and sets user to inactive and
// revokes session in the database
// Allows access back to public pages (i.e. default, login, sign up)
func UnauthorizeUser(r *http.Request, w http.ResponseWriter) bool {

	//Load cookie session ID
	sessionID, err := cookies.GetCookie(r, "session-id")
	if err != nil {
		return false
	}

	intSessionId, _ := strconv.Atoi(sessionID)
	session := services.DB_Sessions{
		SessionId: intSessionId,
	}
	//Load session data
	sessions, err := services.LoadObjectDB[services.DB_Sessions](&session, "SessionId")
	if err != nil {
		return false
	}
	if len(sessions) > 0 {
		session = sessions[0]
	}

	user := services.DB_Users{
		UserId: session.UserId,
	}
	users, err := services.LoadObjectDB[services.DB_Users](&user, "UserId")
	if err != nil {
		return false
	}
	if len(users) > 0 {
		user = users[0]
	}
	// Delete session-id cookie (expire in past)
	_ = cookies.SetCookie(w, "session-id", "", DeleteCookieExpiry)

	success := unactivateSession(user, session)
	if !success {
		//If there was an unsuccessfull unactivation in the database we need to reactivate the user (FOR NOW)
		//Need to develop a more specific error use case
		_ = cookies.SetCookie(w, "session-id", strconv.Itoa(session.SessionId), session.ExpiresAt)
	}
	return true
}

// Checks the session-id cookie for being tampered with. If changed by user unathurize the user
// If the cookie is expired unauthorize user
// If user is confirmed authorized and cookie is under 30 minutes from expiring reset expiration time
func CheckUserAuthorization(r *http.Request, w http.ResponseWriter) (bool, error) {
	sessionID, err := cookies.GetCookie(r, "session-id")
	if err != nil {
		return false, err
	}

	intSessionId, _ := strconv.Atoi(sessionID)
	session := services.DB_Sessions{
		SessionId: intSessionId,
	}

	sessions, err := services.LoadObjectDB[services.DB_Sessions](&session, "SessionId")
	if err != nil {
		return false, err
	}
	if len(sessions) > 0 {
		session = sessions[0]
	}

	//True if Revoked At time is null
	if !session.RevokedAt.Valid {
		expiresAt := session.ExpiresAt.UTC()
		now := time.Now().UTC()

		timeRemaining := expiresAt.Sub(now)
		//true if cookie is expired
		if timeRemaining < 0 {
			_ = UnauthorizeUser(r, w)
			return false, nil
		} else if timeRemaining < 30*time.Minute {
			//refresh cookie and session expiry
			newExpiry := sessionExpiry()
			_ = cookies.SetCookie(w, "session-id", sessionID, newExpiry)
			session.ExpiresAt = newExpiry
			services.UpdateObjectDB(session, "SessionId")
			return true, nil
		}
	}

	return false, nil
}

// Updates user to active and creates active session in database
func activateSession(user services.DB_Users) (int, time.Time) {
	user.IsActive = true
	user.UpdatedAt = time.Now().UTC()
	services.UpdateObjectDB(user, "UserId")

	expiry := sessionExpiry()
	createdAt := time.Now().UTC()

	nullRevoke := sql.NullTime{Valid: false}
	sessionId, err := services.CreateObjectDB(services.DB_Sessions{
		SessionId: 0,
		UserId:    user.UserId,
		CreatedAt: createdAt,
		ExpiresAt: expiry,
		RevokedAt: nullRevoke,
	})
	if err != nil {
		// Handle error
	}
	return sessionId, expiry
}

// Updates user to inactive and updates RevokedAt time for session in database
func unactivateSession(user services.DB_Users, session services.DB_Sessions) bool {
	user.IsActive = false
	user.UpdatedAt = time.Now().UTC()
	err := services.UpdateObjectDB(user, "UserId")
	if err != nil {
		// Handle error
		return false
	}

	//Add revoked time
	session.RevokedAt = sql.NullTime{Time: time.Now().UTC(), Valid: true}

	err = services.UpdateObjectDB(session, "SessionId")
	if err != nil {
		// Handle error
		return false
	}

	return true
}

// Adds new user to the database, hashes password before storing
func CreateNewUser(username string, password string) error {
	hashedPassword := hashPassword(password)
	_, err := services.CreateObjectDB(services.DB_Users{
		UserId:       0,
		Username:     username,
		PasswordHash: hashedPassword,
		IsActive:     true,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	})
	return err
}

// Hashes and encrypts user password
func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		// Handle error
		return ""
	}
	return string(hash)
}

// Compare user given password and hashed password from database
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
