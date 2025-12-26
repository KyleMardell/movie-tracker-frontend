"use client"

import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";

const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const mountedPopular = useRef(false);
    const mountedTrending = useRef(false);
    const mountedRated = useRef(false);

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

    useEffect(() => {
        if (!mountedPopular.current && !isLoading && user) {
            mountedPopular.current = true;
            const loadInitial = async () => {
                setPageLoading(true);
                try {
                    const response = await getPopularMovies(1);
                    setImdbData(response.data.results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setPageLoading(false);
                }
            };
            loadInitial();
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (page === 1) return; // skip initial page
        if (!isLoading && user) {
            const loadPage = async () => {
                setPageLoading(true);
                try {
                    const response = await getPopularMovies(page);
                    setImdbData(prev => [...prev, ...response.data.results]);
                } catch (err) {
                    console.error(err);
                } finally {
                    setPageLoading(false);
                }
            };
            loadPage();
        }
    }, [page, user, isLoading]);

    useEffect(() => {
        if (!mountedRated.current && !isLoading && user) {
            mountedRated.current = true;
            const loadInitial = async () => {
                setRatedPageLoading(true);
                try {
                    const response = await getTopRatedMovies(1);
                    setRatedData(response.data.results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setRatedPageLoading(false);
                }
            };
            loadInitial();
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (ratedPage === 1) return; // skip initial page
        if (!isLoading && user) {
            const loadPage = async () => {
                setRatedPageLoading(true);
                try {
                    const response = await getTopRatedMovies(ratedPage);
                    setRatedData(prev => [...prev, ...response.data.results]);
                } catch (err) {
                    console.error(err);
                } finally {
                    setRatedPageLoading(false);
                }
            };
            loadPage();
        }
    }, [ratedPage, user, isLoading]);

    useEffect(() => {
        if (!mountedTrending.current && !isLoading && user) {
            mountedTrending.current = true;
            const loadTrending = async () => {
                setPageLoading(true);
                try {
                    const response = await getTrendingMovies();
                    setTrendingData(response.data.results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setPageLoading(false);
                }
            };
            loadTrending();
        }
    }, [user, isLoading]);

    const handleMovieClick = (movie: any) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    if (isLoading) return null;
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
                            if (!pageLoading) setPage(prev => prev + 1);
                        }}
                        onMovieClick={handleMovieClick}
                        listName="popular"
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2 className="my-3">Top Rated Movies</h2>
                    <MovieCarousel
                        movies={ratedData}
                        onReachEnd={() => {
                            if (!ratedPageLoading) setRatedPage(prev => prev + 1);
                        }}
                        onMovieClick={handleMovieClick}
                        listName="toprated"
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
                        listName="trending"
                    />
                </Col>
            </Row>
            <MovieModal
                show={modalShow}
                onHide={resetModalState}
                movie={selectedMovie}
            />
        </Container>
    );
};

export default DashboardPage;
