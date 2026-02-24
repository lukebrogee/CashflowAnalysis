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
Jan-28-2026   Added UpdateObjectDB(), changed parameters to accept maps of columns to change/add/remove
-			  and added map for conditions
Feb-24-2026   Added batch functions CreateObjectDB_List() and UpdateObjectDB_List() to create/update in batches for better performance
-             removed InitializeDB() to from DBContext methods
------------------------------------------------------------------
*/
package services

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"reflect"
	"strings"

	"github.com/microsoft/go-mssqldb/azuread"
)

var db *sql.DB
var DATABASE_CONNECTION = ""

// Creates connection to the azure sql database
func InitializeDB() {

	DATABASE_CONNECTION = os.Getenv("DATABASE_CONNECTION")
	if DATABASE_CONNECTION == "" {
		panic("DATABASE_CONNECTION not set in environment")
	}

	var err error

	// Create connection pool
	db, err = sql.Open(azuread.DriverName, DATABASE_CONNECTION)
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
		isDBTag := hasDBTag(entity, field.Name)
		if !isDBTag {
			continue
		}

		fieldNames = append(fieldNames, field.Name)
		placeholders = append(placeholders, "@"+field.Name)
		args = append(args, sql.Named(field.Name, field.Value))
	}

	//Build connection string
	tsql := fmt.Sprintf(`
      INSERT INTO %s (%s) VALUES (%s);
      SELECT ISNULL(CAST(SCOPE_IDENTITY() AS INT), -1);
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

// Creates rows in batches (e.g., 200 at a time) for a slice of entities of the SAME type/table.
// Returns the list of inserted IDs (based on db:"id" tag) in the same order as inserted.
func CreateObjectDB_List[T any](entities []T, batchSize int) ([]int, error) {
	ctx := context.Background()

	if len(entities) == 0 {
		return []int{}, nil
	}
	if batchSize <= 0 {
		batchSize = 200
	}

	// We assume all entities map to the same table and columns.
	first := entities[0]

	tableName, firstFields, err := InspectInterface(first)
	if err != nil {
		return nil, err
	}

	// Determine the "id" field (db tag = "id") so we can OUTPUT it.
	idFieldName, _ := FieldNameByDBTag(first, "id")

	// Determine insertable columns (same logic as CreateObjectDB)
	var colNames []string
	for _, f := range firstFields {
		if f.Name == idFieldName {
			continue
		}
		if !hasDBTag(first, f.Name) {
			continue
		}
		colNames = append(colNames, f.Name)
	}
	if len(colNames) == 0 {
		return nil, fmt.Errorf("CreateObjectsDB: no insertable columns found (db tags missing?)")
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	// Rollback unless we explicitly commit.
	defer func() { _ = tx.Rollback() }()

	insertedIDs := make([]int, 0, len(entities))

	// Process in batches
	for start := 0; start < len(entities); start += batchSize {
		end := start + batchSize
		if end > len(entities) {
			end = len(entities)
		}
		batch := entities[start:end]

		// Build VALUES tuples with unique parameter names per row (p0_Col, p1_Col, ...)
		var valuesTuples []string
		args := make([]interface{}, 0, len(batch)*len(colNames))

		for i, ent := range batch {
			// Optional: enforce same table/shape
			tName, _, err := InspectInterface(ent)
			if err != nil {
				return nil, err
			}
			if tName != tableName {
				return nil, fmt.Errorf("CreateObjectsDB: mixed table types in batch (%s vs %s)", tableName, tName)
			}

			// For each entity, we need field values. Easiest is to InspectInterface(ent) and map by name.
			_, fields, err := InspectInterface(ent)
			if err != nil {
				return nil, err
			}
			fieldMap := make(map[string]interface{}, len(fields))
			for _, f := range fields {
				fieldMap[f.Name] = f.Value
			}

			placeholders := make([]string, 0, len(colNames))
			for _, col := range colNames {
				param := fmt.Sprintf("p%d_%s", i, col) // unique param name per row+col
				placeholders = append(placeholders, "@"+param)
				args = append(args, sql.Named(param, fieldMap[col]))
			}
			valuesTuples = append(valuesTuples, "("+strings.Join(placeholders, ",")+")")
		}

		// Multi-row insert + OUTPUT all inserted identity values
		outputField := ""
		if idFieldName != "" {
			outputField = fmt.Sprintf("OUTPUT INSERTED.%s", idFieldName)
		}
		tsql := fmt.Sprintf(`
			INSERT INTO %s (%s)
			%s
			VALUES %s;
		`,
			tableName,
			strings.Join(colNames, ","),
			outputField,
			strings.Join(valuesTuples, ","),
		)

		stmt, err := tx.PrepareContext(ctx, tsql)
		if err != nil {
			return nil, err
		}

		rows, err := stmt.QueryContext(ctx, args...)
		_ = stmt.Close()
		if err != nil {
			return nil, err
		}

		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				_ = rows.Close()
				return nil, err
			}
			insertedIDs = append(insertedIDs, id)
		}
		if err := rows.Err(); err != nil {
			_ = rows.Close()
			return nil, err
		}
		_ = rows.Close()
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return insertedIDs, nil
}

// Loads one row of data dependant on the conditions given
func LoadObjectDB[T any](entity *T, conditions ...string) ([]T, error) {

	ctx := context.Background()
	var result []T

	if len(conditions) == 0 {
		return result, fmt.Errorf("LoadObjectDB: at least one condition field must be specified")
	}

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return result, err
	}

	var fieldNames []string
	var whereClauses []string
	var args []interface{}
	for _, field := range fields {
		isDBTag := hasDBTag(entity, field.Name)
		if !isDBTag {
			continue
		}
		fieldNames = append(fieldNames, field.Name)
		args = append(args, sql.Named(field.Name, field.Value))
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
		dests := make([]interface{}, len(fieldNames))
		for i := 0; i < len(fieldNames); i++ {
			f := newEntity.Elem().FieldByName(fieldNames[i])
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
func UpdateObjectDB(entity interface{}, setValues []string, conditions []string) error {

	ctx := context.Background()

	if len(conditions) == 0 {
		return fmt.Errorf("UpdateObjectDB: at least one condition field must be specified")
	}

	tableName, fields, err := InspectInterface(entity)
	if err != nil {
		return err
	}

	//Skip adding ID
	idTag, _ := FieldNameByDBTag(entity, "id")

	var length int
	if len(setValues) == 0 {
		length = len(fields)
	} else {
		length = len(setValues) + 1 //Add one for ID
	}
	fieldNames := make([]string, length)
	var whereClauses []string
	args := make([]interface{}, length)
	var fieldCounter int

	for _, field := range fields {
		if len(setValues) == 0 || (idTag == field.Name) || contains(setValues, field.Name) {
			isDBTag := hasDBTag(entity, field.Name)
			if !isDBTag {
				continue
			}
			fieldNames[fieldCounter] = field.Name
			args[fieldCounter] = sql.Named(field.Name, field.Value)
			fieldCounter++
		}
		if len(conditions) > 0 && contains(conditions, field.Name) {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = @%s", field.Name, field.Name))
		}
	}

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

// Creates rows in batches (e.g., 200 at a time) for a slice of entities of the SAME type/table.
// Returns the list of inserted IDs (based on db:"id" tag) in the same order as inserted.
func UpdateObjectDB_List[T any](entities []T, setValues []string, conditions []string, batchSize int) ([]int, error) {
	ctx := context.Background()

	if len(entities) == 0 {
		return []int{}, nil
	}
	if batchSize <= 0 {
		batchSize = 200
	}

	// We assume all entities map to the same table and columns.
	first := entities[0]

	tableName, firstFields, err := InspectInterface(first)
	if err != nil {
		return nil, err
	}

	// Determine the "id" field (db tag = "id") so we can OUTPUT it.
	idFieldName, _ := FieldNameByDBTag(first, "id")
	if idFieldName == "" {
		return nil, fmt.Errorf("CreateObjectsDB: entity must have a field tagged db:\"id\" to return inserted IDs")
	}

	var whereClauses []string

	// Determine insertable columns (same logic as CreateObjectDB)
	var colNames []string
	for _, f := range firstFields {
		if len(setValues) == 0 || (idFieldName == f.Name) || contains(setValues, f.Name) {
			isDBTag := hasDBTag(first, f.Name)
			if !isDBTag {
				continue
			}
			colNames = append(colNames, f.Name)
		}
		if len(conditions) > 0 && contains(conditions, f.Name) {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = @%s", f.Name, f.Name))
		}
	}

	if len(colNames) == 0 {
		return nil, fmt.Errorf("CreateObjectsDB: no insertable columns found (db tags missing?)")
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	// Rollback unless we explicitly commit.
	defer func() { _ = tx.Rollback() }()

	updatedIDs := make([]int, 0, len(entities))

	// Process in batches
	for start := 0; start < len(entities); start += batchSize {
		end := start + batchSize
		if end > len(entities) {
			end = len(entities)
		}
		batch := entities[start:end]

		// Build VALUES tuples with unique parameter names per row (p0_Col, p1_Col, ...)
		var valuesTuples []string
		args := make([]interface{}, 0, len(batch)*len(colNames))

		for i, ent := range batch {
			// Optional: enforce same table/shape
			tName, _, err := InspectInterface(ent)
			if err != nil {
				return nil, err
			}
			if tName != tableName {
				return nil, fmt.Errorf("CreateObjectsDB: mixed table types in batch (%s vs %s)", tableName, tName)
			}

			// For each entity, we need field values. Easiest is to InspectInterface(ent) and map by name.
			_, fields, err := InspectInterface(ent)
			if err != nil {
				return nil, err
			}
			fieldMap := make(map[string]interface{}, len(fields))
			for _, f := range fields {
				fieldMap[f.Name] = f.Value
			}

			placeholders := make([]string, 0, len(colNames))
			for _, col := range colNames {
				param := fmt.Sprintf("p%d_%s", i, col) // unique param name per row+col
				placeholders = append(placeholders, "@"+param)
				args = append(args, sql.Named(param, fieldMap[col]))
			}
			valuesTuples = append(valuesTuples, "("+strings.Join(placeholders, ",")+")")
		}

		// Multi-row insert + OUTPUT all inserted identity values
		tsql := fmt.Sprintf(`
			INSERT INTO %s (%s)
			OUTPUT INSERTED.%s
			VALUES %s;
		`,
			tableName,
			strings.Join(colNames, ","),
			idFieldName,
			strings.Join(valuesTuples, ","),
		)

		stmt, err := tx.PrepareContext(ctx, tsql)
		if err != nil {
			return nil, err
		}

		rows, err := stmt.QueryContext(ctx, args...)
		_ = stmt.Close()
		if err != nil {
			return nil, err
		}

		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				_ = rows.Close()
				return nil, err
			}
			updatedIDs = append(updatedIDs, id)
		}
		if err := rows.Err(); err != nil {
			_ = rows.Close()
			return nil, err
		}
		_ = rows.Close()
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return updatedIDs, nil
}

// Deletes a row of data based on the conditions given
func DeleteObjectDB(entity interface{}, conditions ...string) error {
	ctx := context.Background()

	if len(conditions) == 0 {
		return fmt.Errorf("UpdateObjectDB: at least one condition field must be specified")
	}

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
			isDBTag := hasDBTag(entity, field.Name)
			if !isDBTag {
				continue
			}
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
