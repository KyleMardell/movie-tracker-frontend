"use client"

import { addMovie } from "@/app/lib/api";
import { getMovieDetail } from "@/app/lib/tmdb";
import { useEffect, useState } from "react";
import { Modal, Button, Image } from "react-bootstrap";

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
            console.log(response);
        } catch (err) {
            console.log(err);
        }
    };


    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby={`${movie?.title} details`}
            centered
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
                <Button onClick={handleAddToList}>Add to List</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default MovieModal