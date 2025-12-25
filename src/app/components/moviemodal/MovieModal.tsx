import { Modal, Button, Image } from "react-bootstrap";


const MovieModal = (props: any) => {
    const { movie } = props;
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby={`${movie?.title} details`}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id={`${movie?.title} details`}>
                    {movie?.title || "No movie selected"} <br />Released - {movie?.release_date}
                </Modal.Title>

            </Modal.Header>
            <Modal.Body>
                <Image src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`} fluid />
                <p>
                    {movie?.overview || "No movie selected"}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default MovieModal