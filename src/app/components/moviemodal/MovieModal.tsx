"use client"

import { addMovie, deleteMovie, updateWatchedMovie } from "@/app/lib/api";
import { getMovieDetail, getMovieProviders } from "@/app/lib/tmdb";
import { useEffect, useState, useContext } from "react";
import { Modal, Button, Image, Row, Col } from "react-bootstrap";
import { UserMoviesContext } from "@/app/context/UserMoviesContext";

// Types
type MovieToAdd = {
    title: string;
    tmdb_id: number;
    image_path: string;
    watched: boolean;
};

type MovieProvider = {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
};

type CountryProviders = {
    link: string;
    flatrate?: MovieProvider[];
    rent?: MovieProvider[];
    buy?: MovieProvider[];
    ads?: MovieProvider[];
};

const MovieModal = (props: any) => {
    const { movie } = props;
    const id = movie?.tmdb_id ?? movie?.id;
    const [movieDetail, setMovieDetail] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [movieProviders, setMovieProviders] = useState<CountryProviders | null>(null);

    const context = useContext(UserMoviesContext);
    if (!context) return null;
    const { userMovies, setUserMovies } = context;
    const [movieIsInList, setMovieIsInList] = useState(false);
    const [addedMovieID, setAddedMovieID] = useState(null);
    const [isWatched, setIsWatched] = useState(false);

    useEffect(() => {
        if (!movie?.id) {
            setMovieDetail(null);
            return;
        }

        const loadMovieDetail = async () => {
            setLoadingDetail(true);
            try {
                const response = await getMovieDetail(id);
                setMovieDetail(response.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingDetail(false);
            }
        };

        const loadMovieProviders = async () => {
            try {
                const response = await getMovieProviders(id);
                setMovieProviders(response.data.results["GB"] || null);
            } catch (err) {
                console.log(err);
            }
        };

        loadMovieDetail();
        loadMovieProviders();
    }, [movie]);

    useEffect(() => {
        if (userMovies && movieDetail) {
            const foundMovie = userMovies.find((m) => m.tmdb_id === movieDetail.id);
            if (foundMovie) {
                setMovieIsInList(true);
                setAddedMovieID(foundMovie.id); // custom API ID
                setIsWatched(foundMovie.watched);
            } else {
                setMovieIsInList(false);
                setAddedMovieID(null);
            }
        }
    }, [userMovies, movieDetail]);

    const handleAddToList = async () => {
        if (!movie) return;

        const movieToAdd: MovieToAdd = {
            title: movie.title,
            tmdb_id: movie.id,
            image_path: movie.poster_path,
            watched: false,
        };

        try {
            const response = await addMovie(movieToAdd);
            if (response.status == 201) {
                setUserMovies(prev => [...prev, response.data]);
                setMovieIsInList(true);
            }
            console.log(response); // Change to confirmation feedback
        } catch (err) {
            console.log(err);
        }
    };

    const handleDeleteFromList = async () => {
        if (addedMovieID) {
            try {
                const response = await deleteMovie(addedMovieID);
                console.log(response); // Change to confirmation feedback
                if (response.status == 204) {
                    setMovieIsInList(false);
                    setUserMovies(prev => prev.filter(mov => mov.id !== addedMovieID));
                    setAddedMovieID(null);
                }
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleUpdateWatched = async () => {
        if (!addedMovieID) return;
        try {
            const response = await updateWatchedMovie(addedMovieID);
            if (response.status === 200) {
                setUserMovies(prev =>
                    prev.map(mov =>
                        mov.id === addedMovieID
                            ? { ...mov, watched: !mov.watched }
                            : mov
                    )
                );
            }
        } catch (err) {
            console.log(err);
        }

    };

    const resetModalState = () => {
        setMovieDetail(null);
        setMovieIsInList(false);
        setAddedMovieID(null);
        setIsWatched(false);
        setMovieProviders(null);
    };


    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby={`${movie?.title} details`}
            centered
            onHide={() => {
                resetModalState();
                props.onHide?.();
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title id={`${movie?.title} details`}>
                    {movieDetail?.title || "No movie selected"} <br />Released - {movieDetail?.release_date}
                </Modal.Title>

            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Image src={`https://image.tmdb.org/t/p/w500/${movieDetail?.poster_path}`} fluid />
                        <p>
                            {movieDetail?.overview || "No movie selected"}
                        </p>
                    </Col>
                </Row>
                {
                    movieProviders ?
                        <>
                            {
                                movieProviders?.flatrate ?
                                    <Row>
                                        <h3>Stream</h3>
                                        <Col className="d-flex">
                                            {movieProviders?.flatrate?.map((provider: MovieProvider) => (
                                                <div key={provider.provider_id}>
                                                    <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} />
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                    :
                                    <></>
                            }
                            {
                                movieProviders?.buy ?
                                    <Row>
                                        <h3>Buy</h3>
                                        <Col className="d-flex">
                                            {movieProviders?.buy?.map((provider: MovieProvider) => (
                                                <div key={provider.provider_id}>
                                                    <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} />
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                    :
                                    <></>
                            }
                            {
                                movieProviders?.rent ?
                                    <Row>
                                        <h3>Rent</h3>
                                        <Col className="d-flex">
                                            {movieProviders?.rent?.map((provider: MovieProvider) => (
                                                <div key={provider.provider_id}>
                                                    <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} />
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                    :
                                    <></>
                            }
                        </>
                        :
                        <p>Not available to stream, rent or buy.</p>
                }

            </Modal.Body>
            <Modal.Footer>
                {movieIsInList ? <Button onClick={handleDeleteFromList}>Delete</Button> : <Button onClick={handleAddToList}>Add to List</Button>}

                {movieIsInList ? <Button onClick={handleUpdateWatched}>{isWatched ? "Mark as Unwatched" : "Mark as Watched"}</Button> : <></>}
            </Modal.Footer>
        </Modal>
    )
}

export default MovieModal