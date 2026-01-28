/*
------------------------------------------------------------------
FILE NAME:     DBTables.go
PROJECT:       CashflowAnalysis
Date Created:  Dec-30-2025
--------------------------------------------------------------------
DESCRIPTION:
Structs to represent database tables.
--------------------------------------------------------------------
$HISTORY:

Dec-30-2025   Created initial file.
Dec-30-2025   Added FieldInfo{}, contains(), InspectInterface(), and FieldNameByDBTag()
Jan-28-2026   Added hasDBTag()
------------------------------------------------------------------
*/
package services

import (
	"fmt"
	"reflect"
	"strings"
)

// Stores name and value of variable
type FieldInfo struct {
	Name  string
	Value interface{}
}

// Return true if item is in slice array
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Given an interface, returns the name of struct and FieldInfo{} of each variable
// inside struct
func InspectInterface(v interface{}) (typeName string, fields []FieldInfo, err error) {
	val := reflect.ValueOf(v)
	typ := reflect.TypeOf(v)

	// Handle pointer input
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = typ.Elem()
	}

	if val.Kind() != reflect.Struct {
		return "", nil, fmt.Errorf("expected struct, got %s", val.Kind())
	}

	typeName = typ.Name()
	typeName = strings.TrimPrefix(typeName, "DB_")
	typeName = "dbo.CFA_" + typeName

	for i := 0; i < val.NumField(); i++ {
		fieldType := typ.Field(i)
		fieldValue := val.Field(i)

		// Skip unexported fields
		if !fieldValue.CanInterface() {
			continue
		}

		fields = append(fields, FieldInfo{
			Name:  fieldType.Name,
			Value: fieldValue.Interface(),
		})
	}

	return typeName, fields, nil
}

// Checks the name of tagvalue from `db: "<tagValue>"` on the variable from the struct given
// Returns the name of variable inside struct
func FieldNameByDBTag(v interface{}, tagValue string) (string, error) {
	t := reflect.TypeOf(v)

	// Handle pointer input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	if t.Kind() != reflect.Struct {
		return "", fmt.Errorf("expected struct, got %s", t.Kind())
	}

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		dbTag := field.Tag.Get("db")

		if dbTag == tagValue {
			return field.Name, nil
		}
	}

	return "", nil
}

// Checks if a specific field in a struct has the db tag
func hasDBTag(v any, fieldName string) bool {
	t := reflect.TypeOf(v)

	// Handle pointer input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	if t.Kind() != reflect.Struct {
		return false
	}

	field, found := t.FieldByName(fieldName)
	if !found {
		return false
	}

	dbTag := field.Tag.Get("db")
	return dbTag != ""
}
