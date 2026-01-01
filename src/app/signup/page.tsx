"use client"

import { Form, Container, Row, Col, Button } from "react-bootstrap";
import styles from "./SignUpPage.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { signUpUser } from "../lib/api";

// Types
type SignUpFormData = {
    username: string;
    password1: string;
    password2: string;
}

type signUpPayload = { username: string; password: string; }

const SignUpPage = () => {
    const [signUpData, setSignUpData] = useState<SignUpFormData>({
        username: "",
        password1: "",
        password2: "",
    });
    const { username, password1, password2 } = signUpData;
    const payload: signUpPayload = {
        username,
        password: password1,
    };
    const { setAuthData, user, isLoading } = useAuth();
    const router = useRouter();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setSignUpData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(username, password1, password2);
        if (password1 === password2) {
            try {
                const response = await signUpUser(username, password1);
                console.log("User signed up:", response);
                const data = {
                    user: username,
                    accessToken: response.data.access,
                    refreshToken: response.data.refresh
                };
                setAuthData(data);
                router.push("/");
                // ADD SUCCESS MESSAGE UPON SIGN UP
            } catch (err) {
                console.error("Signup error:", err);
            }
        } else {
            console.log("Passwords DO NOT match");
        }
    };


    return (
        <Container>
            <Row className="mt-5">
                <Col>
                    <img src="/images/logo.png" alt="Movie Tracker Logo" className={styles.logo} />
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column text-center">
                        <Form.Group controlId="username" className="mb-3">
                            <Form.Label className="d-none">Username</Form.Label>
                            <Form.Control
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