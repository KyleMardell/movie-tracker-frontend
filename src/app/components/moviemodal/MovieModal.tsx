"use client"

import { addMovie, deleteMovie, updateWatchedMovie } from "@/app/lib/api";
import { getMovieDetail } from "@/app/lib/tmdb";
import { useEffect, useState, useContext } from "react";
import { Modal, Button, Image } from "react-bootstrap";
import { UserMoviesContext } from "@/app/context/UserMoviesContext";

type MovieToAdd = {
    title: string;
    tmdb_id: number;
    image_path: string;
    watched: boolean;
}


const MovieModal = (props: any) => {
    const { movie } = props;
    const id = movie?.tmdb_id ?? movie?.id;
    const [movieDetail, setMovieDetail] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const context = useContext(UserMoviesContext);
    if (!context) return null;
    const { userMovies, setUserMovies } = context;
    const [movieIsInList, setMovieIsInList] = useState(false);
    const [addedMovieID, setAddedMovieID] = useState(null);

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
        loadMovieDetail();
    }, [movie]);

    useEffect(() => {
        if (userMovies && movieDetail) {
            const foundMovie = userMovies.find((m) => m.tmdb_id === movieDetail.id);
            if (foundMovie) {
                setMovieIsInList(true);
                setAddedMovieID(foundMovie.id); // <-- custom API ID
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
                    setUserMovies(prev => prev.filter(m => m.id !== addedMovieID));
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
                console.log(response);
            } catch (err) {
                console.log(err);
            }
        
    };

    const resetModalState = () => {
        setMovieDetail(null);
        setMovieIsInList(false);
        setAddedMovieID(null);
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
                <Image src={`https://image.tmdb.org/t/p/w500/${movieDetail?.poster_path}`} fluid />
                <p>
                    {movieDetail?.overview || "No movie selected"}
                </p>
            </Modal.Body>
            <Modal.Footer>
                {movieIsInList ? <Button onClick={handleDeleteFromList}>Delete</Button> : <Button onClick={handleAddToList}>Add to List</Button>}

                {movieIsInList ? <Button onClick={handleUpdateWatched}>Mark as Watched</Button> : <></>}
            </Modal.Footer>
        </Modal>
    )
}

export default MovieModal