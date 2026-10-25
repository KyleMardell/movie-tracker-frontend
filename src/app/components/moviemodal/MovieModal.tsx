"use client";


import { addMovie, deleteMovie, updateWatchedMovie } from "@/app/lib/api";
import { getMovieDetail, getMovieProviders } from "@/app/lib/tmdb";
import { useEffect, useState, useContext } from "react";
import { Modal, Button, Row, Col, Spinner, Accordion } from "react-bootstrap";
import { UserMoviesContext } from "@/app/context/UserMoviesContext";
import { MovieToAdd, MovieProvider, CountryProviders, TMDBMovie } from "@/app/types";
import styles from "./MovieModal.module.css";

// UPDATE MOVIE INFORMATION ---- ADD FEATURE

// types
type Movie = {
    id?: number;
    tmdb_id?: number;
    title: string;
    poster_path?: string;
    image_path?: string;
};

type MovieModalProps = {
    movie: Movie | null;
    show: boolean;
    onHide: () => void;
};

// Movie modal shows the movie details
// Allows a user to add a movie to their list, view and change watched status
// Loads the movie details and watch providers on mount
const MovieModal = ({ movie, show, onHide }: MovieModalProps) => {
    const id = movie?.tmdb_id ?? movie?.id;
    // Each selection gets fresh state, including reopening the same movie.
    return <MovieModalContent key={show ? id ?? "none" : "closed"} movie={movie} show={show} onHide={onHide} />;
};

const MovieModalContent = ({ movie, show, onHide }: MovieModalProps) => {
    const id = movie?.tmdb_id ?? movie?.id;
    const [movieDetail, setMovieDetail] = useState<TMDBMovie | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(Boolean(id && show));
    const [movieProviders, setMovieProviders] = useState<CountryProviders | null>(null);
    const context = useContext(UserMoviesContext);
    const foundMovie = context?.userMovies.find(movie => movie.tmdb_id === id);
    const movieIsInList = Boolean(foundMovie);
    const addedMovieID = foundMovie?.id ?? null;
    const isWatched = foundMovie?.watched ?? false;
    const setUserMovies = context?.setUserMovies;

    // gets the movie details and watch providers
    useEffect(() => {
        if (!id || !show) return;
        let active = true;

        const loadMovieDetail = async () => {
            try {
                const response = await getMovieDetail(id);
                if (active) setMovieDetail(response.data);
            } catch {
                console.error("Unable to complete movie request.");
            } finally {
                if (active) setLoadingDetail(false);
            }
        };

        const loadMovieProviders = async () => {
            try {
                const response = await getMovieProviders(id);
                if (active) setMovieProviders(response.data.results["GB"] || null);
            } catch {
                console.error("Unable to complete movie request.");
            }
        };

        loadMovieDetail();
        loadMovieProviders();
        return () => { active = false; };
    }, [id, show]);

    // Adds the movie to the users list and updates the context
    const handleAddToList = async () => {
        if (!movieDetail || !setUserMovies) return;

        const movieToAdd: MovieToAdd = {
            title: movieDetail.title,
            tmdb_id: movieDetail.id,
            image_path: movieDetail.poster_path || "",
            watched: false,
        };

        try {
            const response = await addMovie(movieToAdd);
            if (response.status === 201) {
                setUserMovies(prev => [...prev, response.data]);
            }
        } catch {
            console.error("Unable to complete movie request.");
        }
    };

    // Deletes movie from the users list and updates the context
    const handleDeleteFromList = async () => {
        if (!addedMovieID || !setUserMovies) return;

        try {
            const response = await deleteMovie(addedMovieID);
            if (response.status === 204) {
                setUserMovies((prev) =>
                    prev.filter((mov) => mov.id !== addedMovieID)
                );
            }
        } catch {
            console.error("Unable to complete movie request.");
        }
    };

    // updates the watched status
    const handleUpdateWatched = async () => {
        if (!addedMovieID || !setUserMovies) return;

        try {
            const response = await updateWatchedMovie(addedMovieID);
            if (response.status === 200) {
                setUserMovies((prev) =>
                    prev.map((mov) =>
                        mov.id === addedMovieID
                            ? { ...mov, watched: !mov.watched }
                            : mov
                    )
                );
            }
        } catch {
            console.error("Unable to complete movie request.");
        }
    };

    if (!context) return null;

    // renders the movie details and watch providers
    return (
        <Modal
            show={show}
            size="lg"
            aria-labelledby={`${movie?.title} details`}
            centered
            onHide={onHide}
            className={styles.movieModal}
        >
            <div
                className={styles.posterBackground}
                style={{
                    backgroundImage: movieDetail?.poster_path
                        ? `url(https://image.tmdb.org/t/p/w500/${movieDetail.poster_path})`
                        : "none",
                }}
            >
                {loadingDetail ?
                    <Modal.Body className="d-flex justify-content-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Modal.Body>
                    :
                    <>
                        <div className={styles.modalContent}>
                            <Modal.Header className="zen-dots-regular" closeButton closeVariant="white">
                                <Modal.Title id={`${movie?.title} details`}>
                                    {movieDetail?.title || "No movie selected"}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Accordion className="movie-accordion mb-4">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            <div className="d-flex justify-content-between w-100">
                                                <div>
                                                    Released - {movieDetail?.release_date.slice(0, 4) || "No movie selected"}
                                                </div>
                                                <div className="mx-2">
                                                    Description
                                                </div>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="my-3 electrolize-regular">{movieDetail?.overview || "No movie selected"}</p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                {movieProviders ? (
                                    <>
                                        {movieProviders.flatrate && (
                                            <Row className="mb-3">
                                                <h3>Stream</h3>
                                                {movieProviders.flatrate.map(
                                                    (provider: MovieProvider) => (
                                                        <Col className="d-flex p-0" key={provider.provider_id}>
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                                className={styles.providerLogo}
                                                            />
                                                        </Col>
                                                    )
                                                )}
                                            </Row>
                                        )}

                                        {movieProviders.buy && (
                                            <Row className="mb-3">
                                                <h3>Buy</h3>
                                                {movieProviders.buy.map(
                                                    (provider: MovieProvider) => (
                                                        <Col className="d-flex p-0" key={provider.provider_id}>
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                                className={styles.providerLogo}
                                                            />
                                                        </Col>
                                                    )
                                                )}
                                            </Row>
                                        )}

                                        {movieProviders.rent && (
                                            <Row className="mb-3">
                                                <h3>Rent</h3>
                                                {movieProviders.rent.map(
                                                    (provider: MovieProvider) => (
                                                        <Col className="d-flex p-0" key={provider.provider_id}>
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                                className={styles.providerLogo}
                                                            />
                                                        </Col>
                                                    )
                                                )}
                                            </Row>
                                        )}
                                    </>
                                ) : (
                                    <p>Not available to stream, rent or buy.</p>
                                )}
                            </Modal.Body>

                            <Modal.Footer>
                                {movieIsInList && (
                                    <Button onClick={handleUpdateWatched} className={isWatched ? styles.movieWatchedBtn : styles.movieUnWatchedBtn} >
                                        {isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                                    </Button>
                                )}

                                {movieIsInList ? (
                                    <Button className={styles.removeMovieBtn} onClick={handleDeleteFromList}>Remove from List</Button>
                                ) : (
                                    <Button className={styles.addMovieBtn} onClick={handleAddToList}>Add to List</Button>
                                )}
                            </Modal.Footer>
                        </div>
                    </>
                }
            </div>
        </Modal>
    );
};

export default MovieModal;
