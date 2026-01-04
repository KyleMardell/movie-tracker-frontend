"use client"

import { useState, useEffect } from "react";
import { login } from "../lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Button, Alert, Form } from "react-bootstrap";
import styles from "./LoginPage.module.css";

// log in page allows users to log in
// saves tokens to local storage
const LoginPage = () => {
    const [username, setUsername] = useState<string | "">("");
    const [password, setPassword] = useState<string | "">("");
    const { setAuthData, user, isLoading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);

    // checks if a user is logged in
    useEffect(() => {
        if (!isLoading && user) {
            router.push("/");
        }
    }, [user, isLoading]);

    // logs in to the custom api
    // sets auth data upon successful log in
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            const data = {
                user: username,
                accessToken: response.data.access,
                refreshToken: response.data.refresh
            };
            setAuthData(data);
            router.push("/");
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("API Network Error, please try again.");
            }
            setShowError(true);
        }
    };

    // renders the log in page with simple log in form
    return (
        <Container>
            {
                showError && (
                    <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                        <Alert.Heading>Oh No! You got an error.</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )
            }
            <Row className="mt-5">
                <Col>
                    <img src="/images/logo.png" alt="Movie Tracker Logo" className={styles.logo} />
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column text-center">
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="username" hidden>Username</Form.Label>
                            <Form.Control type="text" id="username" value={username} placeholder="Username" onChange={e => { setUsername(e.target.value); setError(null); }} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="password" hidden>Password</Form.Label>
                            <Form.Control type="password" name="password" id="password" value={password} placeholder="Password" onChange={e => { setPassword(e.target.value); setError(null); }} required />
                        </Form.Group>
                        <Button type="submit" className={styles.loginButton}>Login</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default LoginPage