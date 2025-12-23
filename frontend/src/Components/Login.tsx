import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";


function LoginComponent() {
      const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const {login} = useAuth();
    const handleLogin = () => {
        // Implement your login logic here
        fetch(`/api/login/${username}`, { method: "POST" })
            .then(response => {
                if (response.ok) {
                    console.log("Login successful");
                    login(username);
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
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginComponent;