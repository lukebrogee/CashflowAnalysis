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
Jan-28-2026   Added DB_WidgetBoard{}, DB_WidgetBoardRows{}, DB_Widgets{}, DB_WidgetLinkedAccounts{}

	Deleted DB_UserWidgets{}
	Also added `db` tags to all structs for mapping purposes

------------------------------------------------------------------
*/
package services

import (
	"database/sql"
	"time"
)

type DB_Sessions struct {
	SessionId int          `db:"id"`
	UserId    int          `db:"UserId"`
	CreatedAt time.Time    `db:"CreatedAt"`
	ExpiresAt time.Time    `db:"ExpiresAt"`
	RevokedAt sql.NullTime `db:"RevokedAt"`
}

type DB_Users struct {
	UserId       int       `db:"id"`
	Username     string    `db:"Username"`
	PasswordHash string    `db:"PasswordHash"`
	IsActive     bool      `db:"IsActive"`
	CreatedAt    time.Time `db:"CreatedAt"`
	UpdatedAt    time.Time `db:"UpdatedAt"`
}

type DB_LinkedInstitutions struct {
	LinkedInstitutionID int       `db:"id"`
	UserID              int       `db:"UserID"`
	AccessToken         string    `db:"AccessToken"`
	ItemID              string    `db:"ItemID"`
	InstitutionName     string    `db:"InstitutionName"`
	InstitutionID       string    `db:"InstitutionID"`
	CreatedAt           time.Time `db:"CreatedAt"`
	UpdatedAt           time.Time `db:"UpdatedAt"`
}

type DB_LinkedAccounts struct {
	AccountID           int       `db:"id"`
	LinkedInstitutionID int       `db:"LinkedInstitutionID"`
	Mask                *string   `db:"Mask"`
	Name                string    `db:"Name"`
	OfficialName        *string   `db:"OfficialName"`
	Subtype             *string   `db:"Subtype"`
	Type                string    `db:"Type"`
	VerificationStatus  *string   `db:"VerificationStatus"`
	HolderCategory      *string   `db:"HolderCategory"`
	CreatedAt           time.Time `db:"CreatedAt"`
	UpdatedAt           time.Time `db:"UpdatedAt"`
}

type DB_AccountBalance struct {
	AccountBalanceID       int        `db:"id"`
	LinkedInstitutionID    int        `db:"LinkedInstitutionID"`
	AccountID              int        `db:"AccountID"`
	Available              *float64   `db:"Available"`
	CurrentAmount          *float64   `db:"CurrentAmount"`
	LimitAmount            *float64   `db:"LimitAmount"`
	ISOCurrencyCode        *string    `db:"ISOCurrencyCode"`
	UnofficialCurrencyCode *string    `db:"UnofficialCurrencyCode"`
	AccountLastUpdatedAt   *time.Time `db:"AccountLastUpdatedAt"`
	CreatedAt              time.Time  `db:"CreatedAt"`
	UpdatedAt              time.Time  `db:"UpdatedAt"`
}

type DB_WidgetBoard struct {
	WidgetBoardID   int `db:"id"`
	UserID          int `db:"UserID"`
	WidgetBoardRows []DB_WidgetBoardRows
}

type DB_WidgetBoardRows struct {
	RowID         int    `db:"id"`
	WidgetBoardID int    `db:"WidgetBoardID"`
	RowType       string `db:"RowType"`
	SortOrder     int    `db:"SortOrder"`
	Widgets       []DB_Widgets
}

type DB_Widgets struct {
	WidgetID       int     `db:"id"`
	WidgetType     *string `db:"WidgetType"`
	RowID          int     `db:"RowID"`
	ColumnType     string  `db:"ColumnType"`
	SortOrder      int     `db:"SortOrder"`
	LinkedAccounts []DB_WidgetLinkedAccounts
}

//var DB_Widgetsptr = &DB_Widgets{}

type DB_WidgetLinkedAccounts struct {
	WidgetID        int       `db:"WidgetID"`
	LinkedAccountID int       `db:"LinkedAccountID"`
	CreatedAt       time.Time `db:"CreatedAt"`
}
