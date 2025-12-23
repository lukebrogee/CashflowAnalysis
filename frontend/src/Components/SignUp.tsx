import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";


function SignUpComponent() {
      const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const {login} = useAuth();
    const handleSignUp = () => {
        // Implement your signup logic here
        fetch(`/api/signup/${username}`, { method: "POST" })
            .then(response => {
                if (response.ok) {
                    console.log("Signup successful");
                    login(username);
                    navigate("/dashboard");
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
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default SignUpComponent;