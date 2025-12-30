/*
------------------------------------------------------------------
FILE NAME:     logout.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Logic for logging out a user
--------------------------------------------------------------------
$HISTORY:

Dec-30-2025   Created initial file.
Dec-30-2025   Added logout()
------------------------------------------------------------------
*/

export function logout() {

    fetch(`/api/logout/`, { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
    .then(response => {
        if (response.ok) {
            console.log("Logout successful");
        } else {
            console.log("logout failed");
        }
    })
    .catch(error => {
        console.error("Error during logout:", error);
    });
}