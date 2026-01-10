"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { searchMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";
import styles from "./MovieSearchPage.module.css";

// types
type Movie = {
    id: number;
    title: string;
    poster_path: string;
    image_path: string;
};

type Movies = Movie[];

// Search movie page, allows the user to search for a movie
// displays a list of results
const MovieSearchPage = () => {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const [searchTerm, setSearchTerm] = useState<string | "">("");
    const [searchResults, setSearchResults] = useState<Movies | []>([]);
    const [resultsPage, setResultsPage] = useState(1)
    const [resultsLoading, setResultsLoading] = useState(false);

    // user auth
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    // send search term to the tmdb api and updates results
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchResults([]);
        setResultsPage(1);
        setResultsLoading(true);
        try {
            const response = await searchMovies(searchTerm, 1);
            // see response.data.results for search results array.
            setSearchResults(response.data.results);
            if (response.data.results.length == 0) {
                setNoResults(true);
            }
        } catch (err: any) {
            setError(err);
            setShowError(true);
        } finally {
            setResultsLoading(false);
        }
    };

    // pagination loads additional pages when the scroll reaches the current list end
    useEffect(() => {
        if (resultsPage === 1) return;

        const loadPage = async () => {
            setResultsLoading(true);
            try {
                const response = await searchMovies(searchTerm, resultsPage);
                setSearchResults(prev => [...prev, ...response.data.results]);
            } catch (err) {
                console.error(err);
            } finally {
                setResultsLoading(false);
            }
        };

        loadPage();
    }, [resultsPage, searchTerm]);

    // shows the movie modal when a movie is clicked
    const handleMovieClick = (movie: any) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    // resets the modal when closed
    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    // renders the search results list
    // displays a simple search form
    return (
        <Container>
            {
                showError && (
                    <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                        <Alert.Heading className="zen-dots-regular">Oh No! You got an error.</Alert.Heading>
                        <p className="electrolize-regular">{error}</p>
                    </Alert>
                )
            }
            {
                noResults && (
                    <Alert variant="dark" onClose={() => { setShowError(false); }} className="text-center" dismissible>
                        <Alert.Heading className="zen-dots-regular">Oops, there are no search results for {searchTerm}</Alert.Heading>
                        <p className="electrolize-regular">please try another search</p>
                    </Alert>
                )
            }
            <Row className="my-5 text-center">
                <Col>
                    <h1>Search Movies</h1>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column text-center">
                        <Form.Group className="mb-3">
                            <Form.Label hidden>Search Movies</Form.Label>
                            <Form.Control type="text" name="searchTerm" id="searchTerm" value={searchTerm} placeholder="Enter movie name" onChange={e => { setSearchTerm(e.target.value); setError(null); }} required />
                        </Form.Group>
                        <Button type="submit" className={styles.searchButton}>
                            Search
                        </Button>
                    </Form>
                </Col>
            </Row>
            {
                searchResults.length > 0 && (
                    <Row>
                        <Col>
                            <h2 className="my-3">Search Results</h2>
                            <MovieCarousel
                                movies={searchResults}
                                onReachEnd={() => {
                                    if (!resultsLoading && searchTerm) {
                                        setResultsPage(prev => prev + 1);
                                    }
                                }}
                                onMovieClick={handleMovieClick}
                                listName="searchresults"
                            />
                        </Col>
                    </Row>
                )
            }

            <MovieModal
                show={modalShow}
                onHide={resetModalState}
                movie={selectedMovie}
            />
        </Container>
    )
}

export default MovieSearchPage