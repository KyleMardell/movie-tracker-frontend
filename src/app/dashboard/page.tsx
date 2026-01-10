"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Container, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";
import styles from "./Dashboard.module.css";

// types
type Movie = {
    id: number;
    title: string;
    poster_path: string;
    image_path: string;
};

type Movies = Movie[];

// dashboard displays tmdb movie lists
// popular, top rated and trending movie lists
const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const searchParams = useSearchParams();
    const welcome = searchParams.get("welcome");
    const [showWelcome, setShowWelcome] = useState(false);

    const mountedPopular = useRef(false);
    const mountedTrending = useRef(false);
    const mountedRated = useRef(false);

    const [imdbData, setImdbData] = useState<Movies | []>([]);
    const [trendingData, setTrendingData] = useState<Movies | []>([]);
    const [ratedData, setRatedData] = useState<Movies | []>([]);

    const [page, setPage] = useState(1);
    const [ratedPage, setRatedPage] = useState(1);
    const [pageLoading, setPageLoading] = useState(false);
    const [ratedPageLoading, setRatedPageLoading] = useState(false);

    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);

    // User auth, checks for a user and a new user welcome param
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
        if (welcome === "true") {
            setShowWelcome(true);
        }
    }, [user, isLoading, welcome, router]);

    // if user welcome message is shown, remove param from url
    useEffect(() => {
        if (showWelcome) {
            router.replace("/dashboard", { scroll: false });
        }
    }, [showWelcome, router]);

    // gets the initial list of popular movies from the tmdb api
    useEffect(() => {
        if (!mountedPopular.current && !isLoading && user) {
            mountedPopular.current = true;
            const loadInitial = async () => {
                setPageLoading(true);
                try {
                    const response = await getPopularMovies(1);
                    setImdbData(response.data.results);
                } catch (err: any) {
                    console.error(err);
                    setError(err);
                    setShowError(true);
                } finally {
                    setPageLoading(false);
                }
            };
            loadInitial();
        }
    }, [user, isLoading]);

    // loads second page of results upon scroll
    useEffect(() => {
        if (page === 1) return; // skip initial page
        if (!isLoading && user) {
            const loadPage = async () => {
                setPageLoading(true);
                try {
                    const response = await getPopularMovies(page);
                    setImdbData(prev => [...prev, ...response.data.results]);
                } catch (err: any) {
                    console.error(err);
                    setError(err);
                    setShowError(true);
                } finally {
                    setPageLoading(false);
                }
            };
            loadPage();
        }
    }, [page, user, isLoading]);

    // gets the initial list of top rated movies from the tmdb api
    useEffect(() => {
        if (!mountedRated.current && !isLoading && user) {
            mountedRated.current = true;
            const loadInitial = async () => {
                setRatedPageLoading(true);
                try {
                    const response = await getTopRatedMovies(1);
                    setRatedData(response.data.results);
                } catch (err: any) {
                    console.error(err);
                    setError(err);
                    setShowError(true);
                } finally {
                    setRatedPageLoading(false);
                }
            };
            loadInitial();
        }
    }, [user, isLoading]);

    // loads second page of results upon scroll
    useEffect(() => {
        if (ratedPage === 1) return; // skip initial page
        if (!isLoading && user) {
            const loadPage = async () => {
                setRatedPageLoading(true);
                try {
                    const response = await getTopRatedMovies(ratedPage);
                    setRatedData(prev => [...prev, ...response.data.results]);
                } catch (err: any) {
                    console.error(err);
                    setError(err);
                    setShowError(true);
                } finally {
                    setRatedPageLoading(false);
                }
            };
            loadPage();
        }
    }, [ratedPage, user, isLoading]);

    // gets the initial list of currently trending movies from the tmdb api
    // only loads 20 movies so no need for additional useEffect hook
    useEffect(() => {
        if (!mountedTrending.current && !isLoading && user) {
            mountedTrending.current = true;
            const loadTrending = async () => {
                setPageLoading(true);
                try {
                    const response = await getTrendingMovies();
                    setTrendingData(response.data.results);
                } catch (err: any) {
                    console.error(err);
                    setError(err);
                    setShowError(true);
                } finally {
                    setPageLoading(false);
                }
            };
            loadTrending();
        }
    }, [user, isLoading]);

    // sets the selected movie when clicked
    const handleMovieClick = (movie: Movie) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    // resets the modal when closed
    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    // if no user exists returns nothing
    if (isLoading) return null;
    if (!user) return null;

    // renders the movie lists using the movie carousel component
    // for all movie lists
    return (
        <Container>
            {showWelcome && (
                <Alert className={styles.welcomeAlert} onClose={() => setShowWelcome(false)} dismissible >
                    <Alert.Heading className="zen-dots-regular">Welcome to my Movie Tracker!</Alert.Heading>
                    <p className="electrolize-regular">
                        You can scroll through movie lists, search for movies by name,
                        add them to your list and mark them as watched.
                        <br />
                        Keep track of the movies you have watched or want to watch, all in one simple to use app!
                    </p>
                </Alert>
            )}
            {
                showError && (
                    <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                        <Alert.Heading className="zen-dots-regular">Oh No! You got an error.</Alert.Heading>
                        <p className="electrolize-regular">{error}</p>
                    </Alert>
                )
            }
            <Row className="text-center my-5">
                <Col>
                    <h1>Home</h1>
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
