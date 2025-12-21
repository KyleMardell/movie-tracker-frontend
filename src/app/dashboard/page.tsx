"use client"

import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    if (isLoading) return null; // or a spinner later

    if (!user) return null;

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Dashboard</h1>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
