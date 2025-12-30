/*
------------------------------------------------------------------
FILE NAME:     DBTables.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Structs to represent database tables.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-20-2025   Added DB_Session{} and DB_Users{}
------------------------------------------------------------------
*/
package services

import (
	"database/sql"
	"time"
)

type DB_Sessions struct {
	SessionId int `db:"id"`
	UserId    int
	CreatedAt time.Time
	ExpiresAt time.Time
	RevokedAt sql.NullTime
}

type DB_Users struct {
	UserId       int `db:"id"`
	Username     string
	PasswordHash string
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
