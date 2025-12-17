"use client"
import { useState } from "react";
import { login } from "../lib/api";


const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [movieTrackerData, setMovieTrackerData] = useState({user: "", accessToken: "", refreshToken: ""}); 


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response =  await login(username, password);
        console.log(response.data);

        const data = {
            user: username,
            accessToken: response.data.access,
            refreshToken: response.data.refresh
        };

        localStorage.setItem("movieTrackerData", JSON.stringify(data));
        setMovieTrackerData(data);
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