"use client"

import { useState, useEffect } from "react";
import { login } from "../lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";

const LoginPage = () => {
    const [username, setUsername] = useState<string | "">("");
    const [password, setPassword] = useState<string | "">("");
    const { setAuthData, user, isLoading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean | false>(false);

    useEffect(() => {
        if (!isLoading && user) {
            router.push("/");
        }
    }, [user, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("API Network Error, please try again.");
            }
            setShowError(true);
        }
    }

    

    return (
        <Container>
            {
                showError ?
                <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                    <Alert.Heading>Oh No! You got an error.</Alert.Heading>
                    <p>{error}</p>
                </Alert>
                : <></>
            }
            
            <Row>
                <Col>
                    <form onSubmit={handleSubmit}>
                        <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError(null); }} required/>
                        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(null); }} required/>
                        <Button type="submit" variant="primary">Login</Button>
                    </form>
                </Col>
            </Row>
            
        </Container>
    )
}

export default LoginPage