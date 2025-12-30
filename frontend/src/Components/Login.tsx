/*
------------------------------------------------------------------
FILE NAME:     Login.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Component for user to login with credentials. Authorizes user on login.
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Added password to login form and authentication
------------------------------------------------------------------
*/
import React from "react";
import { useNavigate } from "react-router-dom";


function LoginComponent() {
      const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const handleLogin = () => {
        // Implement your login logic here
        fetch(`/api/login/`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                username: username,
                password: password
             }),
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Login successful");
                    navigate("/dashboard"); 
                } else {
                    console.log("Login failed");
                }
            })
            .catch(error => {
                console.error("Error during login:", error);
            });
    }

    return (
        <div>
            <h1>Login Component</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <label>
                    Username:
                    <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginComponent;