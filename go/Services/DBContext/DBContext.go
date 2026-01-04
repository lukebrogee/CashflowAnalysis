/*
------------------------------------------------------------------
FILE NAME:     DBContext.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Interacts with the database to create, read, update, and delete records.
By giving an entity struct, the functions will map the struct fields to database table columns.

https://learn.microsoft.com/en-us/azure/azure-sql/database/connect-query-go?view=azuresql
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Added functions initializeDB(), CreateObjectDB(), LoadObjectDB(), and DeleteObjectDB()
Jan-04-2026   Updated LoadObjectDB() to return an array of T values
------------------------------------------------------------------
*/
package services

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"
	"strings"

	"github.com/microsoft/go-mssqldb/azuread"
)

var db *sql.DB

// Creates connection to the azure sql database
func initializeDB() {
	connString := "Server=jbrogee2019.database.windows.net;Database=Empowr;User Id=jbrogeelogin19;Password=ZoeyIsGood19!!;"
	var err error

	// Create connection pool
	db, err = sql.Open(azuread.DriverName, connString)
	if err != nil {
		fmt.Printf("Error creating connection pool: %v\n", err)
		return
	}

	//Used to ping database for being active
	//ctx := context.Background()
	//err = db.PingContext(ctx)
	//if err != nil {
	//	fmt.Printf("Error pinging database: %v\n", err)
	//	return
	//}
	fmt.Printf("Connected!\n")
}

// Creates a new row of data for the given "table" interface
func CreateObjectDB(entity interface{}) (int, error) {
	ctx := context.Background()
	var err error

	initializeDB()

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return -1, err
	}

	//Check if variable has `db: "id"` tag. If true dont attempt
	//to add to sql call since sql table creates id
	var fieldNames []string
	var placeholders []string
	idTag, _ := FieldNameByDBTag(entity, "id")
	var args []interface{}

	for _, field := range fields {
		if idTag == field.Name {
			continue
		}
		fieldNames = append(fieldNames, field.Name)
		placeholders = append(placeholders, "@"+field.Name)
		args = append(args, sql.Named(field.Name, field.Value))
	}

	//Build connection string
	tsql := fmt.Sprintf(`
      INSERT INTO %s (%s) VALUES (%s);
      select isNull(SCOPE_IDENTITY(), -1);
    `, tableName, strings.Join(fieldNames, ","), strings.Join(placeholders, ","))

	//Prepare sql connection
	stmt, err := db.Prepare(tsql)
	if err != nil {
		return -1, err
	}
	defer stmt.Close()

	//Call database to store
	row := stmt.QueryRowContext(ctx, args...)
	var newID int
	err = row.Scan(&newID)
	if err != nil {
		return -1, err
	}

	return newID, nil
}

// Loads one row of data dependant on the conditions given
func LoadObjectDB[T any](entity *T, conditions ...string) ([]T, error) {

	ctx := context.Background()
	var result []T

	if len(conditions) == 0 {
		return result, fmt.Errorf("LoadObjectDB: at least one condition field must be specified")
	}

	initializeDB()

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return result, err
	}

	fieldNames := make([]string, len(fields))
	var whereClauses []string
	args := make([]interface{}, len(fields))
	for i, field := range fields {
		fieldNames[i] = field.Name
		args[i] = sql.Named(field.Name, field.Value)
		if len(conditions) > 0 && contains(conditions, field.Name) {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = @%s", field.Name, field.Name))
		}
	}

	//Build connection string
	whereString := strings.Join(whereClauses, " AND ")
	tsql := fmt.Sprintf("SELECT %s FROM %s WHERE %s;", strings.Join(fieldNames, ","), tableName, whereString)

	//prepare sql connection
	rows, err := db.QueryContext(ctx, tsql, args...)
	if err != nil {
		return result, err
	}
	defer rows.Close()

	// Ensure caller passed a pointer-to-struct type for entity
	entityType := reflect.TypeOf(entity)
	if entityType.Kind() != reflect.Ptr || entityType.Elem().Kind() != reflect.Struct {
		return result, fmt.Errorf("LoadObjectDB: entity must be pointer to struct")
	}

	for rows.Next() {

		// Create a new pointer to a zero value of the struct (e.g., *MyStruct)
		newEntity := reflect.New(entityType.Elem())

		// Prepare destinations for Scan: either field addresses or temporary holders
		dests := make([]interface{}, len(fields))
		for i := 0; i < len(fields); i++ {
			f := newEntity.Elem().FieldByName(fields[i].Name)
			if f.IsValid() && f.CanAddr() {
				dests[i] = f.Addr().Interface()
			} else {
				var tmp interface{}
				dests[i] = &tmp
			}
		}

		// Scan row values into the prepared destinations
		if err := rows.Scan(dests...); err != nil {
			return result, err
		}

		// Convert the newly populated pointer value to T and return it
		out := newEntity.Elem().Interface().(T)
		result = append(result, out)
		//return out, nil
	}

	return result, nil
}

// Updates one row of data based on the conditions given
func UpdateObjectDB(entity interface{}, conditions ...string) error {

	ctx := context.Background()

	if len(conditions) == 0 {
		return fmt.Errorf("UpdateObjectDB: at least one condition field must be specified")
	}

	initializeDB()

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return err
	}

	fieldNames := make([]string, len(fields))
	var whereClauses []string
	args := make([]interface{}, len(fields))
	for i, field := range fields {
		fieldNames[i] = field.Name
		args[i] = sql.Named(field.Name, field.Value)
		if len(conditions) > 0 && contains(conditions, field.Name) {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = @%s", field.Name, field.Name))
		}
	}

	//Skip adding ID
	idTag, _ := FieldNameByDBTag(entity, "id")
	var fieldNamesFinal []string
	for _, fieldName := range fieldNames {
		if idTag == fieldName {
			//remove name from fieldnames
			continue
		}
		fieldNamesFinal = append(fieldNamesFinal, fmt.Sprintf("%s = @%s", fieldName, fieldName))
	}

	//Build connection stirng
	whereString := strings.Join(whereClauses, " AND ")
	tsql := fmt.Sprintf("UPDATE %s SET %s WHERE %s;", tableName, strings.Join(fieldNamesFinal, ","), whereString)

	//Call sql database
	_, err = db.ExecContext(ctx, tsql, args...)
	if err != nil {
		return err
	}
	return nil
}

// Deletes a row of data based on the conditions given
func DeleteObjectDB(entity interface{}, conditions ...string) error {
	ctx := context.Background()

	if len(conditions) == 0 {
		return fmt.Errorf("UpdateObjectDB: at least one condition field must be specified")
	}

	initializeDB()

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return err
	}

	fieldNames := make([]string, len(fields))
	var whereClauses []string
	args := make([]interface{}, len(fields))
	for i, field := range fields {
		fieldNames[i] = field.Name
		if len(conditions) > 0 && contains(conditions, field.Name) {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = @%s", field.Name, field.Name))
			args[i] = sql.Named(field.Name, field.Value)
		}
	}

	//Build connection string
	whereString := strings.Join(whereClauses, " AND ")
	tsql := fmt.Sprintf("DELETE FROM %s WHERE %s;", tableName, whereString)

	//Call sql database
	_, err = db.ExecContext(ctx, tsql, args...)
	if err != nil {
		return err
	}
	return nil
}
