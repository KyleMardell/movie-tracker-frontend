"use client"

import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";

const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [imdbData, setImdbData] = useState<any[]>([]);
    const [trendingData, setTrendingData] = useState<any[]>([]);
    const [ratedData, setRatedData] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const [ratedPage, setRatedPage] = useState(1);
    const [pageLoading, setPageLoading] = useState(false);
    const [ratedPageLoading, setRatedPageLoading] = useState(false);

    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

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

    useEffect(() => {
        if (!isLoading && user) {
            const loadMovies = async () => {
                setPageLoading(true);
                try {
                    const response = await getTrendingMovies();
                    setTrendingData(response.data.results);
                    console.log(response.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setPageLoading(false);
                }
            };
            loadMovies();
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (!isLoading && user) {
            const loadMovies = async () => {
                setRatedPageLoading(true);
                try {
                    const response = await getTopRatedMovies(ratedPage);
                    if (response.data.results.length === 0) return; // no more results
                    setRatedData(prev => [...prev, ...response.data.results]);
                    console.log(response.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setRatedPageLoading(false);
                }
            };
            loadMovies();
        }
    }, [user, isLoading, ratedPage]);

    const handleMovieClick = (movie: any) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    if (isLoading) return null; // or a spinner later
    if (!user) return null;

    return (
        <Container>
            <Row>
                <Col className="text-center my-5">
                    <h1>Dashboard</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2 className="my-3">Popular Movies</h2>
                    <MovieCarousel
                        movies={imdbData}
                        onReachEnd={() => {
                            if (!pageLoading) {
                                setPage(prev => prev + 1);
                            }
                        }}
                        onMovieClick={handleMovieClick}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2 className="my-3">Top Rated Movies</h2>
                    <MovieCarousel
                        movies={ratedData}
                        onReachEnd={() => {
                            if (!ratedPageLoading) {
                                setRatedPage(prev => prev + 1);
                            }
                        }}
                        onMovieClick={handleMovieClick}
                    />
                </Col>
            </Row>
            <Row className="mb-5">
                <Col>
                    <h2 className="my-3">Trending Movies</h2>
                    <MovieCarousel
                        movies={trendingData}
                        onReachEnd={() => { }}
                        onMovieClick={handleMovieClick}
                    />
                </Col>
            </Row>
            <MovieModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                movie={selectedMovie}
            />
        </Container>
    );
};

export default DashboardPage;
