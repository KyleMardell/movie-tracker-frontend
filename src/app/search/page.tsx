"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../useAuth";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { searchMovies } from "../lib/tmdb";
import MovieCarousel from "../components/moviecarousel/MovieCarousel";
import MovieModal from "../components/moviemodal/MovieModal";
import styles from "./MovieSearchPage.module.css";

const MovieSearchPage = () => {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState<string | "">("");
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean | false>(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [resultsPage, setResultsPage] = useState<number>(1)
    const [resultsLoading, setResultsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchResults([]);
        setResultsPage(1);
        setResultsLoading(true);
        try {
            console.log("Searching for:", searchTerm);
            const response = await searchMovies(searchTerm, 1);
            // see response.data.results for search results array.
            setSearchResults(response.data.results);
        } catch (err: any) {
            setError(err);
            setShowError(true);
        } finally {
            setResultsLoading(false);
        }
    };

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

    const handleMovieClick = (movie: any) => {
        setSelectedMovie(movie);
        setModalShow(true);
    };

    const resetModalState = () => {
        setModalShow(false);
        setSelectedMovie(null);
    };

    return (
        <Container>
            {
                showError ?
                    <Alert variant="danger" onClose={() => { setShowError(false); }} dismissible>
                        <Alert.Heading>Oh No! You got an error.</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                    : <></>
            }
            <Row>
                <Col className="d-flex justify-content-center">
                    <Form onSubmit={handleSubmit} className="d-flex flex-column text-center">
                        <Form.Group className="mb-3">
                            <Form.Label>Search Movies</Form.Label>
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