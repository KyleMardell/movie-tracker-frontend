"use client"
import { useState, useEffect } from "react";
import { login } from "../lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Button } from "react-bootstrap";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setAuthData, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push("/");
        }
    }, [user, isLoading]);

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
        router.push("/");
    }

    return (
        <Container>
            <Row>
                <Col>
                    <form onSubmit={handleSubmit}>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        <Button type="submit" variant="primary">Login</Button>
                    </form>
                </Col>
            </Row>
            
        </Container>
    )
}

export default LoginPage