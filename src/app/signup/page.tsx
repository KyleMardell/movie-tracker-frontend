"use client"

import { Form, Container, Row, Col, Button, Alert } from "react-bootstrap";
import styles from "./SignUpPage.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { signUpUser } from "../lib/api";

// Types
type SignUpFormData = {
    username: string;
    password1: string;
    password2: string;
};

// sign up page allows new users to sign up to the app
// sends sign up data to the custom api and auto logs in using returned tokens
const SignUpPage = () => {
    const [signUpData, setSignUpData] = useState<SignUpFormData>({
        username: "",
        password1: "",
        password2: "",
    });
    const { username, password1, password2 } = signUpData;
    const { setAuthData, user, isLoading } = useAuth();
    const [signedUp, setSignedUp] = useState(false);
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);

    // checks if a user is logged in
    useEffect(() => {
        if (!isLoading && user && !signedUp) {
            router.push("/");
        }
    }, [user, isLoading, signedUp]);

    // updates state of username and password fields
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setSignUpData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // upon submit, sends sign up data to api and auto logs in using returned tokens
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password1 === password2) {
            try {
                const response = await signUpUser(username, password1);
                console.log("User signed up:", response);
                const data = {
                    user: username,
                    accessToken: response.data.access,
                    refreshToken: response.data.refresh
                };
                setSignedUp(true);
                setAuthData(data);
                router.push("/?welcome=true");
                // ADD SUCCESS MESSAGE UPON SIGN UP
            } catch (err: any) {
                setError(err);
                setShowError(true);
            }
        } else {
            setError("Passwords DO NOT match");
            setShowError(true);
        }
    };

    // renders the sign up page and sign up form
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
            <Row className="my-5">
                <Col>
                    <img src="/images/logo.webp" alt="Movie Tracker Logo" className={styles.logo} />
                </Col>
            </Row>
            <Row className="text-center mb-3">
                <Col>
                    <h1>Sign Up</h1>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column text-center">
                        <Form.Group controlId="username" className="mb-3">
                            <Form.Label className="d-none">Username</Form.Label>
                            <Form.Control
                                className="electrolize-regular"
                                type="text"
                                placeholder="Username"
                                name="username"
                                value={username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="password1" className="mb-3">
                            <Form.Label className="d-none">Password</Form.Label>
                            <Form.Control
                                className="electrolize-regular"
                                type="password"
                                placeholder="Password"
                                name="password1"
                                value={password1}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="password2" className="mb-3">
                            <Form.Label className="d-none">
                                Confirm Password
                            </Form.Label>
                            <Form.Control
                                className="electrolize-regular"
                                type="password"
                                placeholder="Confirm Password"
                                name="password2"
                                value={password2}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" className={styles.signupButton}>Sign Up</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default SignUpPage