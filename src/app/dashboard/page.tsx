"use client"

import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPopularMovies } from "../lib/tmdb";

const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // User auth
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);


    // TMDB API
    useEffect(() => {
        if (!isLoading && user) {
            const loadMovies = async () => {
                try {
                    const response = await getPopularMovies();
                    console.log(response.data);
                } catch (err) {
                    console.error(err);
                }
            };
            loadMovies();
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
