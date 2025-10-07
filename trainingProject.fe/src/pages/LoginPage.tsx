import { useState } from "react"
import { useNavigate } from "react-router-dom"

//Hat de El Tony Mathe Theo schon gemacht

export default function LoginPage(){
    const navigate = useNavigate();
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailedMessage, setLoginFailedMessage] = useState("");
    
    const handleSubmit =async (event: React.FormEvent) => {
        event.preventDefault()
        
        const response = await fetch("http://localhost:5065/api/Authenticate/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password })
        });
        const data = await response.json();
        
        if (response.status === 200 && data.message === "Success") 
        {
            localStorage.setItem("username", data.username);
            localStorage.setItem("token", data.token);
            navigate("/");
        }
        else{
            setLoginFailedMessage(data.message);
        }
    }
    
    return (
        <>
            <div className="login-container">
                <div className="login-header">
                    <h1>TravelDingsBums</h1>
                    <p>Login</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="inputUsername">Username</label>
                        <input
                            type="text"
                            placeholder="Username"
                            id="inputUsername"
                            onChange={(event) => setUsername(event.target.value)}
                            value={username}
                            required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputPassword">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            id="inputPassword"
                            onChange={(event) => setPassword(event.target.value)}
                            value={password}
                            required/>
                    </div>
                    
                    <button type="submit" className="login-btn">Login</button>
                    
                    <div className="error-message">
                        {loginFailedMessage}
                    </div>
                    
                    <div className="login-footer">
                        <p>Don't have an account? <a href="/register">Register here</a></p>
                    </div>
                </form>
            </div>
        </>
    )
}