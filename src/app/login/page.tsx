"use client"
import { useState } from "react";
import { login } from "../lib/api";
import { useAuth } from "../useAuth";


const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setAuthData } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response =  await login(username, password);
        console.log(response.data);

        const data = {
            user: username,
            accessToken: response.data.access,
            refreshToken: response.data.refresh
        };
        setAuthData(data);
        localStorage.setItem("movieTrackerData", JSON.stringify(data));
        console.log(username, password);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginPage