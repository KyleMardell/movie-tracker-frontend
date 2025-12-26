import { getMovieDetail } from "@/app/lib/tmdb";
import { useEffect, useState } from "react";
import { Modal, Button, Image } from "react-bootstrap";


const MovieModal = (props: any) => {
    const { movie } = props;
    const id = movie?.id;
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
                const response = await getMovieDetail(movie.id);
                setMovieDetail(response.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingDetail(false);
            }
        };
        loadMovieDetail();
    }, [movie]);


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
            </Modal.Footer>
        </Modal>
    )
}

export default MovieModal