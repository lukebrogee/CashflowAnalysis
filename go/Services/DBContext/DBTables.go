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
Dec-30-2025   Added DB_Session{} and DB_Users{}
Jan-04-2026   Added DB_LinkedInstitutions{}, DB_LinkedAccounts{}, DB_AccountBalance{}
Jan-06-2026   Added DB_UserWidgets{}
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

type DB_LinkedInstitutions struct {
	LinkedInstitutionID int `db:"id"`
	UserID              int
	AccessToken         string
	ItemID              string
	InstitutionName     string
	InstitutionID       string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type DB_LinkedAccounts struct {
	AccountID           int `db:"id"`
	LinkedInstitutionID int
	Mask                *string
	Name                string
	OfficialName        *string
	Subtype             *string
	Type                string
	VerificationStatus  *string
	HolderCategory      *string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type DB_AccountBalance struct {
	AccountBalanceID       int `db:"id"`
	LinkedInstitutionID    int
	AccountID              int
	Available              *float64
	CurrentAmount          *float64
	LimitAmount            *float64
	ISOCurrencyCode        *string
	UnofficialCurrencyCode *string
	AccountLastUpdatedAt   *time.Time
	CreatedAt              time.Time
	UpdatedAt              time.Time
}

type DB_UserWidgets struct {
	WidgetID      int `db:"id"`
	UserWidgetID  int
	InstitutionID int
	AccountID     int
}
