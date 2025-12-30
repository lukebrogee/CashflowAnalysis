/*
------------------------------------------------------------------
FILE NAME:     SignUp.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Form for creating a new user
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Added password to sign up form and authentication
------------------------------------------------------------------
*/
import React from "react";
import { useNavigate } from "react-router-dom";

function SignUpComponent() {
      const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const handleSignUp = () => {
        fetch(`/api/signup/`, { 
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
                    console.log("signup successful");
                    navigate("/dashboard"); 
                } else {
                    console.log("signup failed");
                }
            })
            .catch(error => {
                console.error("Error during signup:", error);
            });
    }

    return (
        <div>
            <h1>Sign Up Component</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                <label>
                    Username:
                    <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default SignUpComponent;