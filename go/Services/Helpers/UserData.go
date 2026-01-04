/*
------------------------------------------------------------------
FILE NAME:     UserData.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-30-2025
--------------------------------------------------------------------
DESCRIPTION:
Helper methods to return user specific data
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Jan-06-2025   Added GetUserID()
------------------------------------------------------------------
*/

package helpers

import (
	cookies "cashflowanalysis/CookieHandler"
	services "cashflowanalysis/Services/DBContext"
	"net/http"
	"strconv"
)

// Retrieves the users ID from the session-id cookie
func GetUserID(r *http.Request) int {
	//Load cookie session ID
	sessionID, err := cookies.GetCookie(r, "session-id")
	if err != nil {
		return 0
	}

	intSessionId, _ := strconv.Atoi(sessionID)
	session := services.DB_Sessions{
		SessionId: intSessionId,
	}
	//Load session data
	sessions, err := services.LoadObjectDB(&session, "SessionId")
	if err != nil {
		return 0
	}
	if len(sessions) > 0 {
		session = sessions[0]
	}

	user := services.DB_Users{
		UserId: session.UserId,
	}
	users, err := services.LoadObjectDB(&user, "UserId")
	if err != nil {
		return 0
	}
	if len(users) > 0 {
		user = users[0]
	}

	return user.UserId
}
