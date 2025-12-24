"use client"

import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPopularMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";

const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [imdbData, setImdbData] = useState<any[]>([]);

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
                    setImdbData(response.data.results);
                    console.log(response.data.results);
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
            <Row>
                <Col>
                    <MovieCarousel movies={imdbData} />
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
