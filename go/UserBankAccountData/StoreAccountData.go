/*
------------------------------------------------------------------
FILE NAME:     StoreAccountData.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Stores user account and institution data into azure sql servers
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Jan-04-2026   Added StoreUserPlaidData()
Jan-06-2026   Added SaveWidgetData()
Jan-28-2026   Added methods for handling Widget Board DeleteWidgetData(), CreateWidgetRow(), DeleteWidgetRow(), and RetrieveWidgetData()

------------------------------------------------------------------
*/
package userbankaccountdata

import (
	helper "cashflowanalysis/Services/Helpers"
	"net/http"
	"time"

	plaidServices "cashflowanalysis/PlaidComponents"
	services "cashflowanalysis/Services/DBContext"
)

// After retrieving the accesstoken, gather institution and account data.
// Then store all data into azure sql
func StoreUserPlaidData(r *http.Request, publicToken string) bool {
	userID := helper.GetUserID(r)
	accessToken, err := plaidServices.GetAccessToken(publicToken)
	if err != nil {
		return false
	}
	linkedAccounts, err := plaidServices.Accounts()
	if err != nil {
		return false
	}
	item, institution, err := plaidServices.Item()
	if err != nil {
		return false
	}

	institutionId := storeInstitutionData(userID, accessToken, item.ItemId, institution)

	for _, acc := range linkedAccounts {
		storeAccountData(institutionId, acc)
	}

	return true
}

// Links bank accounts to a specific widget on the users screen
func SaveWidgetData(widgetID int, widgetType string, accounts []services.DB_WidgetLinkedAccounts) error {

	widget := services.DB_Widgets{
		WidgetID:   widgetID,
		WidgetType: &widgetType,
	}

	err := services.UpdateObjectDB(widget, []string{"WidgetType"}, []string{"WidgetID"})
	if err != nil {
		return err
	}

	for _, acc := range accounts {
		acc.CreatedAt = time.Now()
		_, err := services.CreateObjectDB(acc)
		if err != nil {
			return err
		}
	}
	return nil
}

// Deletes widget and its linked accounts from the database
func DeleteWidgetData(widgetID int) error {
	widget := services.DB_Widgets{
		WidgetID:   widgetID,
		WidgetType: nil,
	}
	err := services.UpdateObjectDB(widget, []string{"WidgetType"}, []string{"WidgetID"})
	if err != nil {
		return err
	}
	liAccount := services.DB_WidgetLinkedAccounts{
		WidgetID: widgetID,
	}
	err = services.DeleteObjectDB(liAccount, "WidgetID")
	if err != nil {
		return err
	}
	return nil
}

// Creates a new widget row with widgets and linked accounts
func CreateWidgetRow(row *services.DB_WidgetBoardRows) bool {

	rowID, err := services.CreateObjectDB(row)
	if err != nil {
		return false
	}
	row.RowID = rowID
	for i := range row.Widgets {
		row.Widgets[i].RowID = rowID
		widgetID, err := services.CreateObjectDB(&row.Widgets[i])
		row.Widgets[i].WidgetID = widgetID
		if err != nil {
			return false
		}
	}
	return true
}

// Deletes a widget row and its associated widgets
func DeleteWidgetRow(rowID int) bool {

	widget := services.DB_Widgets{
		RowID: rowID,
	}
	err := services.DeleteObjectDB(widget, "RowID")
	if err != nil {
		return false
	}

	row := services.DB_WidgetBoardRows{
		RowID: rowID,
	}
	err = services.DeleteObjectDB(row, "RowID")
	if err != nil {
		return false
	}
	return true
}

// Retrieves widget board data for a user
func RetrieveWidgetData(r *http.Request) services.DB_WidgetBoard {
	userID := helper.GetUserID(r)
	widgetBoard := services.DB_WidgetBoard{
		UserID: userID,
	}
	widgetBoards, _ := services.LoadObjectDB(&widgetBoard, "UserID")
	if !(len(widgetBoards) > 0) {
		return services.DB_WidgetBoard{}
	}
	widgetBoard.WidgetBoardID = widgetBoards[0].WidgetBoardID
	row := services.DB_WidgetBoardRows{
		WidgetBoardID: widgetBoard.WidgetBoardID,
	}
	widgetBoard.WidgetBoardRows, _ = services.LoadObjectDB(&row, "WidgetBoardID")
	for i := range widgetBoard.WidgetBoardRows {
		widgets, _ := services.LoadObjectDB(&services.DB_Widgets{
			RowID: widgetBoard.WidgetBoardRows[i].RowID,
		}, "RowID")
		widgetBoard.WidgetBoardRows[i].Widgets = widgets
		for _, w := range widgetBoard.WidgetBoardRows[i].Widgets {
			linkedAccounts, _ := services.LoadObjectDB(&services.DB_WidgetLinkedAccounts{
				WidgetID: w.WidgetID,
			}, "WidgetID")
			w.LinkedAccounts = linkedAccounts
		}
	}

	return widgetBoard
}
