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
Jun-11-2025   Updated UI Design
------------------------------------------------------------------
*/
import React from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../images/logos/MoneyLensLogo_Square_BackgroundColor_Motto.png";
import styles from "./Login.module.scss";

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
        <div className={styles.loginContainer}>
            <div className={styles.loginLogo}>
                <img src={logoImage} alt="MoneyLens Logo" className={styles.loginLogoImg} style={{ width: "550px", height: "auto", paddingBottom: "15px" }} />
            </div>

            <div className={styles.loginForm}>
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                    <h1 className={styles.loginFormHeader}>Sign Up</h1>

                    <label className={styles.loginFormsFont}/>Username<br/>
                    <input className={styles.loginTextBox} type="text" name="Email" value={username} onChange={(e) => setUsername(e.target.value)}/><br/>

                    <label className={styles.loginFormFont}>Password</label><br/>
                    <input className={styles.loginTextBox} type="password" name="Password" value={password} onChange={(e) => setPassword(e.target.value)}/><br/><br/>

                    <div>
                        <p><a asp-action="SignUp" >Have an account? Log in</a></p>
                    </div>
                    <div style={{ paddingTop: "15px" }}>
                        <input className={styles.loginSubmitBox} type="submit" value="Sign Up"/>
                    </div>
                </form>
            </div>
        </div>       
    );
}

export default SignUpComponent;