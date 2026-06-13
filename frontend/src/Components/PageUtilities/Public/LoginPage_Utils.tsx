/*
------------------------------------------------------------------
FILE NAME:     LoginPage_Utils.tsx
PROJECT:       MoneyLens
Date Created:  Jun-13-2026
--------------------------------------------------------------------
DESCRIPTION:

--------------------------------------------------------------------
$HISTORY:

Jun-13-2026   Created initial file.
------------------------------------------------------------------
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage_Utils.module.scss";
import logoImage from "../../../images/logos/MoneyLensLogo_Square_BackgroundColor_Motto.png";


export const LoginComponent = () => {
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
        <div className={styles.loginContainer}>
            <div className={styles.loginLogo}>
                <img src={logoImage} alt="MoneyLens Logo" className={styles.loginLogoImg} style={{ width: "550px", height: "auto", paddingBottom: "15px" }} />
            </div>

            <div className={styles.loginForm}>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <h1 className={styles.loginFormHeader}>Log in</h1>

                    <label className={styles.loginFormsFont}/>Username<br/>
                    <input className={styles.loginTextBox} type="text" name="Email" value={username} onChange={(e) => setUsername(e.target.value)}/><br/>

                    <label className={styles.loginFormFont}>Password</label><br/>
                    <input className={styles.loginTextBox} type="password" name="Password" value={password} onChange={(e) => setPassword(e.target.value)}/><br/><br/>

                    <div>
                        <p><a asp-action="SignUp" >Don't have an account? Sign up</a></p>
                    </div>
                    <div style={{ paddingTop: "15px" }}>
                        <input className={styles.loginSubmitBox} id="createLogin" type="submit" value="Log in"/>
                    </div>
                </form>
            </div>
        </div>       
    );
}