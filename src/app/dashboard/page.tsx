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
    const [page, setPage] = useState(1);
    const [pageLoading, setPageLoading] = useState(false);

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
                setPageLoading(true);
                try {
                    const response = await getPopularMovies(page);
                    if (response.data.results.length === 0) return; // no more results
                    setImdbData(prev => [...prev, ...response.data.results]);
                    console.log(response.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setPageLoading(false);
                }
            };
            loadMovies();
        }
    }, [user, isLoading, page]);

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
                    <MovieCarousel
                        movies={imdbData}
                        onReachEnd={() => {
                            if (!pageLoading) {
                                setPage(prev => prev + 1);
                            }
                        }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;
