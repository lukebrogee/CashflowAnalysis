package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
)

type User struct {
	Username string              `json:"username"`
	Items    []LinkedInstitution `json:"items"`
}

func StoreNewUserData(username string) error {

	filePath := "./data.json"

	// Load existing data (or create empty map)
	users := make(map[string]User)
	if _, err := os.Stat(filePath); err == nil {
		data, err := os.ReadFile(filePath)
		if err == nil {
			_ = json.Unmarshal(data, &users)
		}
	}

	// Example: add a new user
	newUser := User{
		Username: username,
		Items:    []LinkedInstitution{},
	}
	//Random number generator for userID
	newUserID := fmt.Sprintf("user%d", rand.Intn(1000))
	users[newUserID] = newUser

	// Write updated map back to JSON file
	file, _ := json.MarshalIndent(users, "", "  ")
	_ = os.WriteFile(filePath, file, 0644)

	return nil
}
